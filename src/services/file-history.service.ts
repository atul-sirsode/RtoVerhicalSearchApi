import mysql from "mysql2/promise";
import * as crypto from "crypto";
import * as XLSX from "xlsx";
import { env } from "../config/env.js";

export interface FileHistoryEntry {
  id: number;
  same_file_name: string;
  file_type: string;
  record_count: number;
  size_bytes: number;
  content_sha256: string;
  created_at: string;
  file_blob?: Buffer;
}

const dbConfig = {
  host: env.DB_HOST || "72.62.228.184",
  user: env.DB_USER || "u914664103_rto",
  password: env.DB_PASSWORD || "6@t9W*GCRA",
  database: env.DB_NAME || "u914664103_rto",
  charset: "utf8mb4",
};

const TABLE_NAME = env.DB_TABLE || "processed_file_history";

// Fallback in-memory storage for testing
const fallbackStorage: FileHistoryEntry[] = [];
let fallbackIdCounter = 1;

async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.warn("Database connection failed, using fallback storage:", error);
    return null; // Return null to indicate fallback mode
  }
}

export class FileHistoryService {
  /**
   * Calculate record count from Excel or CSV file
   */
  private calculateRecordCount(
    file: Buffer,
    fileName: string,
    mimeType: string,
  ): number {
    try {
      let workbook: XLSX.WorkBook;

      // Handle different file types
      if (
        mimeType.includes("sheet") ||
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls")
      ) {
        // Excel file
        workbook = XLSX.read(file, { type: "buffer" });
      } else if (mimeType.includes("csv") || fileName.endsWith(".csv")) {
        // CSV file
        workbook = XLSX.read(file, { type: "buffer" });
      } else {
        return 0;
      }

      let totalRows = 0;

      // Iterate through all sheets
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        if (worksheet) {
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          totalRows += jsonData.length;
        }
      }

      return totalRows;
    } catch (error) {
      console.error("Error calculating record count:", error);
      return 0;
    }
  }

  /**
   * Save a file to history
   */
  async saveFileToHistory(
    file: Buffer,
    entry: Omit<
      FileHistoryEntry,
      "id" | "created_at" | "size_bytes" | "content_sha256"
    >,
  ): Promise<number> {
    const connection = await getConnection();

    try {
      // Auto-calculate record count from file
      const autoRecordCount = this.calculateRecordCount(
        file,
        entry.same_file_name,
        entry.file_type,
      );
      // Use auto-calculated count if provided count is 0 or invalid
      const finalRecordCount =
        entry.record_count > 0 ? entry.record_count : autoRecordCount;

      if (!connection) {
        // Fallback mode - use in-memory storage
        const mockEntry: FileHistoryEntry = {
          id: fallbackIdCounter++,
          same_file_name: entry.same_file_name,
          file_type: entry.file_type,
          record_count: finalRecordCount,
          size_bytes: file.length,
          content_sha256: this.calculateSHA256(file),
          created_at: new Date().toISOString(),
          file_blob: file,
        };
        fallbackStorage.push(mockEntry);
        console.log("Fallback: File saved to history", mockEntry);
        return mockEntry.id;
      }

      // Database mode
      const sha256Hash = crypto.createHash("sha256").update(file).digest("hex");

      // Check if file with same hash already exists
      const [existingRows] = (await connection.execute(
        `SELECT id FROM ${TABLE_NAME} WHERE content_sha256 = ?`,
        [sha256Hash],
      )) as [{ id: number }[], mysql.FieldPacket[]];

      if (existingRows.length > 0 && existingRows[0]) {
        return existingRows[0].id; // Return existing file ID
      }

      // Insert new file record
      const [result] = (await connection.execute(
        `INSERT INTO ${TABLE_NAME} 
         (same_file_name, file_type, record_count, size_bytes, content_sha256, file_blob)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          entry.same_file_name,
          entry.file_type,
          finalRecordCount,
          file.length,
          sha256Hash,
          file,
        ],
      )) as [mysql.ResultSetHeader, mysql.FieldPacket[]];

      return result.insertId;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Get file history with pagination
   */
  async getFileHistory(
    limit: number = 50,
    offset: number = 0,
  ): Promise<FileHistoryEntry[]> {
    const connection = await getConnection();

    try {
      if (!connection) {
        // Fallback mode - return from in-memory storage
        console.log("Fallback: Getting file history");
        return [...fallbackStorage]
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
          .slice(offset, offset + limit);
      }

      // Database mode
      const [rows] = (await connection.execute(
        `SELECT id, same_file_name, file_type, record_count, 
                size_bytes, content_sha256, created_at
         FROM ${TABLE_NAME} 
         ORDER BY created_at DESC 
         LIMIT ${parseInt(limit.toString())} OFFSET ${parseInt(offset.toString())}`,
      )) as [
        {
          id: number;
          same_file_name: string;
          file_type: string;
          record_count: number;
          size_bytes: number;
          content_sha256: string;
          created_at: Date;
        }[],
        mysql.FieldPacket[],
      ];

      return rows.map((row) => ({
        ...row,
        created_at: new Date(row.created_at).toISOString(),
      }));
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  // Simplified other methods with fallback support
  async getFileBlob(id: number): Promise<Buffer | null> {
    const connection = await getConnection();
    try {
      if (!connection) {
        const entry = fallbackStorage.find((e) => e.id === id);
        return entry?.file_blob || null;
      }
      const [rows] = (await connection.execute(
        `SELECT file_blob FROM ${TABLE_NAME} WHERE id = ?`,
        [id],
      )) as [{ file_blob: Buffer }[], mysql.FieldPacket[]];
      return rows.length > 0 && rows[0] ? rows[0].file_blob : null;
    } finally {
      if (connection) await connection.end();
    }
  }

  async deleteFileFromHistory(id: number): Promise<void> {
    const connection = await getConnection();
    try {
      if (!connection) {
        const index = fallbackStorage.findIndex((e) => e.id === id);
        if (index > -1) fallbackStorage.splice(index, 1);
        return;
      }
      await connection.execute(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
    } finally {
      if (connection) await connection.end();
    }
  }

  async searchFilesByName(fileName: string): Promise<FileHistoryEntry[]> {
    const connection = await getConnection();
    try {
      if (!connection) {
        return fallbackStorage
          .filter((entry) =>
            entry.same_file_name.toLowerCase().includes(fileName.toLowerCase()),
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
      }
      const [rows] = (await connection.execute(
        `SELECT id, same_file_name, file_type, record_count, 
                size_bytes, content_sha256, created_at
         FROM ${TABLE_NAME} 
         WHERE same_file_name LIKE ?
         ORDER BY created_at DESC`,
        [`%${fileName}%`],
      )) as [
        {
          id: number;
          same_file_name: string;
          file_type: string;
          record_count: number;
          size_bytes: number;
          content_sha256: string;
          created_at: Date;
        }[],
        mysql.FieldPacket[],
      ];
      return rows.map((row) => ({
        ...row,
        created_at: new Date(row.created_at).toISOString(),
      }));
    } finally {
      if (connection) await connection.end();
    }
  }

  async getFileHistoryStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    totalRecords: number;
  }> {
    const connection = await getConnection();
    try {
      if (!connection) {
        return {
          totalFiles: fallbackStorage.length,
          totalSize: fallbackStorage.reduce(
            (sum, entry) => sum + entry.size_bytes,
            0,
          ),
          totalRecords: fallbackStorage.reduce(
            (sum, entry) => sum + entry.record_count,
            0,
          ),
        };
      }
      const [rows] = (await connection.execute(
        `SELECT 
          COUNT(*) as total_files,
          SUM(size_bytes) as total_size,
          SUM(record_count) as total_records
         FROM ${TABLE_NAME}`,
      )) as [
        { total_files: number; total_size: number; total_records: number }[],
        mysql.FieldPacket[],
      ];
      return {
        totalFiles: rows[0]?.total_files || 0,
        totalSize: rows[0]?.total_size || 0,
        totalRecords: rows[0]?.total_records || 0,
      };
    } finally {
      if (connection) await connection.end();
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  calculateSHA256(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }
}
