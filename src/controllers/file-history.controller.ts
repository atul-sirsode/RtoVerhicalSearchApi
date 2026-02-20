import type { Request, Response } from "express";
import { FileHistoryService } from "../services/file-history.service.js";
import { env } from "../config/env.js";

const fileHistoryService = new FileHistoryService();

// Extend Request interface to include file property
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     FileHistoryEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: File ID
 *           example: 1
 *         same_file_name:
 *           type: string
 *           description: File name
 *           example: "data.csv"
 *         file_path:
 *           type: string
 *           description: File path
 *           example: "/uploads/data.csv"
 *         file_type:
 *           type: string
 *           description: MIME type
 *           example: "text/csv"
 *         record_count:
 *           type: integer
 *           description: Number of records
 *           example: 100
 *         size_bytes:
 *           type: integer
 *           description: File size in bytes
 *           example: 1024
 *         content_sha256:
 *           type: string
 *           description: SHA256 hash
 *           example: "abc123..."
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /api/file-history:
 *   get:
 *     summary: Get file history
 *     tags: [File History]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: List of file history entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FileHistoryEntry'
 *       500:
 *         description: Server error
 */
export const getFileHistory = async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || "50");
    const offset = parseInt((req.query.offset as string) || "0");

    const history = await fileHistoryService.getFileHistory(limit, offset);
    res.json(history);
  } catch (error) {
    console.error("Error getting file history:", error);
    res.status(500).json({ error: "Failed to get file history" });
  }
};

/**
 * @swagger
 * /api/file-history:
 *   post:
 *     summary: Save file to history
 *     tags: [File History]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - same_file_name
 *               - file_path
 *               - file_type
 *               - record_count
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               same_file_name:
 *                 type: string
 *                 description: File name
 *                 example: "data.csv"
 *               file_path:
 *                 type: string
 *                 description: File path
 *                 example: "/uploads/data.csv"
 *               file_type:
 *                 type: string
 *                 description: MIME type
 *                 example: "text/csv"
 *               record_count:
 *                 type: integer
 *                 description: Number of records
 *                 example: 100
 *     responses:
 *       200:
 *         description: File saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: File ID
 *                   example: 1
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
export const saveFileToHistory = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { same_file_name, file_type, record_count, operation_type } =
      req.body;

    // Auto-generate missing fields
    const fileName = same_file_name || file.originalname;
    const mimeType = file_type || file.mimetype;
    const recordCount = record_count ? parseInt(record_count) : 0; // Let service auto-calculate

    // Keep original filename unchanged - use operation_type for detection
    const finalFileName = fileName;

    // Truncate file_type to fit database varchar(50) limit
    const truncatedMimeType = mimeType.substring(0, 50);

    const fileBuffer = file.buffer;
    const entry = {
      same_file_name: finalFileName,
      file_type: truncatedMimeType,
      record_count: recordCount,
    };

    const fileId = await fileHistoryService.saveFileToHistory(
      fileBuffer,
      entry,
    );

    // Get the saved entry to return the actual record count
    const history = await fileHistoryService.getFileHistory(1, 0);
    const savedEntry = history.find((f) => f.id === fileId);

    res.json({
      id: fileId,
      message: "File saved successfully",
      record_count: savedEntry?.record_count || 0,
      auto_calculated: recordCount === 0,
    });
  } catch (error) {
    console.error("Error saving file to history:", error);

    // Handle multer errors
    if (error instanceof Error && error.message.includes("Only Excel")) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to save file to history" });
  }
};

/**
 * @swagger
 * /api/file-history/{id}:
 *   get:
 *     summary: Get file blob by ID
 *     tags: [File History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: File ID
 *     responses:
 *       200:
 *         description: File blob
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
export const getFileBlob = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const blob = await fileHistoryService.getFileBlob(id);
    if (!blob) {
      return res.status(404).json({ error: "File not found" });
    }

    // Get file info to set proper headers
    const history = await fileHistoryService.getFileHistory(1, 0);
    const fileInfo = history.find((f) => f.id === id);

    res.setHeader(
      "Content-Type",
      fileInfo?.file_type || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileInfo?.same_file_name || "file"}"`,
    );
    res.send(blob);
  } catch (error) {
    console.error("Error getting file blob:", error);
    res.status(500).json({ error: "Failed to get file" });
  }
};

/**
 * @swagger
 * /api/file-history/{id}:
 *   delete:
 *     summary: Delete file from history
 *     tags: [File History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: File ID
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
export const deleteFileFromHistory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    await fileHistoryService.deleteFileFromHistory(id);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file from history:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

/**
 * @swagger
 * /api/file-history/search:
 *   get:
 *     summary: Search files by name
 *     tags: [File History]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FileHistoryEntry'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
export const searchFilesByName = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await fileHistoryService.searchFilesByName(query);
    res.json(results);
  } catch (error) {
    console.error("Error searching files:", error);
    res.status(500).json({ error: "Failed to search files" });
  }
};

/**
 * @swagger
 * /api/file-history/stats:
 *   get:
 *     summary: Get file history statistics
 *     tags: [File History]
 *     responses:
 *       200:
 *         description: Statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalFiles:
 *                   type: integer
 *                   description: Total number of files
 *                   example: 10
 *                 totalSize:
 *                   type: integer
 *                   description: Total size in bytes
 *                   example: 10240
 *                 totalRecords:
 *                   type: integer
 *                   description: Total number of records
 *                   example: 1000
 *       500:
 *         description: Server error
 */
export const getFileHistoryStats = async (req: Request, res: Response) => {
  try {
    const stats = await fileHistoryService.getFileHistoryStats();
    res.json(stats);
  } catch (error) {
    console.error("Error getting file history stats:", error);
    res.status(500).json({ error: "Failed to get statistics" });
  }
};
