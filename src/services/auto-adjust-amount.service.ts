import mysql from "mysql2/promise";
import { env } from "../config/env.js";
import type {
  AutoAdjustAmount,
  AutoAdjustAmountCreate,
  AutoAdjustAmountUpdate,
} from "../models/auto-adjust-amount.model.js";

const dbConfig = {
  host: env.DB_HOST || "72.62.228.184",
  user: env.DB_USER || "u914664103_rto",
  password: env.DB_PASSWORD || "6@t9W*GCRA",
  database: env.DB_NAME || "u914664103_rto",
  charset: "utf8mb4",
};

async function getDbConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.warn("Database connection failed:", error);
    return null;
  }
}

export class AutoAdjustAmountService {
  /**
   * Get auto adjust amount by ID
   */
  async getAutoAdjustAmount(id: number): Promise<{
    status: boolean;
    message: string;
    data?: AutoAdjustAmount;
    statuscode?: number;
  }> {
    try {
      const connection = await getDbConnection();

      if (!connection) {
        return {
          status: false,
          message: "Database connection failed",
          statuscode: 500,
        };
      }

      const query = "SELECT id, amount FROM auto_adjust_amount WHERE id = ?";
      const [rows] = await connection.execute(query, [id]);

      await connection.end();

      if (!Array.isArray(rows) || rows.length === 0) {
        return {
          status: false,
          message: "Auto adjust amount not found",
          statuscode: 404,
        };
      }

      const result = rows[0] as any;
      const autoAdjustAmount: AutoAdjustAmount = {
        id: result.id,
        amount: parseFloat(result.amount),
      };

      return {
        status: true,
        message: "Auto adjust amount retrieved successfully",
        data: autoAdjustAmount,
      };
    } catch (error) {
      console.error("Error getting auto adjust amount:", error);
      return {
        status: false,
        message: "Internal server error while retrieving auto adjust amount",
        statuscode: 500,
      };
    }
  }

  /**
   * Get all auto adjust amounts
   */
  async getAllAutoAdjustAmounts(): Promise<{
    status: boolean;
    message: string;
    data?: AutoAdjustAmount[];
    statuscode?: number;
  }> {
    try {
      const connection = await getDbConnection();

      if (!connection) {
        return {
          status: false,
          message: "Database connection failed",
          statuscode: 500,
        };
      }

      const query = "SELECT id, amount FROM auto_adjust_amount ORDER BY id";
      const [rows] = await connection.execute(query);

      await connection.end();

      if (!Array.isArray(rows)) {
        return {
          status: true,
          message: "No auto adjust amounts found",
          data: [],
        };
      }

      const autoAdjustAmounts: AutoAdjustAmount[] = rows.map((row: any) => ({
        id: row.id,
        amount: parseFloat(row.amount),
      }));

      return {
        status: true,
        message: "Auto adjust amounts retrieved successfully",
        data: autoAdjustAmounts,
      };
    } catch (error) {
      console.error("Error getting all auto adjust amounts:", error);
      return {
        status: false,
        message: "Internal server error while retrieving auto adjust amounts",
        statuscode: 500,
      };
    }
  }

  /**
   * Update auto adjust amount by ID
   */
  async updateAutoAdjustAmount(
    id: number,
    updateData: AutoAdjustAmountUpdate,
  ): Promise<{
    status: boolean;
    message: string;
    data?: AutoAdjustAmount;
    statuscode?: number;
  }> {
    try {
      // Validate amount
      if (updateData.amount < 0) {
        return {
          status: false,
          message: "Amount must be a positive number",
          statuscode: 400,
        };
      }

      const connection = await getDbConnection();

      if (!connection) {
        return {
          status: false,
          message: "Database connection failed",
          statuscode: 500,
        };
      }

      // First check if the record exists
      const checkQuery = "SELECT id FROM auto_adjust_amount WHERE id = ?";
      const [checkRows] = await connection.execute(checkQuery, [id]);

      if (!Array.isArray(checkRows) || checkRows.length === 0) {
        await connection.end();
        return {
          status: false,
          message: "Auto adjust amount not found",
          statuscode: 404,
        };
      }

      // Update the record
      const updateQuery =
        "UPDATE auto_adjust_amount SET amount = ? WHERE id = ?";
      const [updateResult] = await connection.execute(updateQuery, [
        updateData.amount,
        id,
      ]);

      // Get the updated record
      const selectQuery =
        "SELECT id, amount FROM auto_adjust_amount WHERE id = ?";
      const [rows] = await connection.execute(selectQuery, [id]);

      await connection.end();

      if (!Array.isArray(rows) || rows.length === 0) {
        return {
          status: false,
          message: "Failed to retrieve updated auto adjust amount",
          statuscode: 500,
        };
      }

      const result = rows[0] as any;
      const autoAdjustAmount: AutoAdjustAmount = {
        id: result.id,
        amount: parseFloat(result.amount),
      };

      return {
        status: true,
        message: "Auto adjust amount updated successfully",
        data: autoAdjustAmount,
      };
    } catch (error) {
      console.error("Error updating auto adjust amount:", error);
      return {
        status: false,
        message: "Internal server error while updating auto adjust amount",
        statuscode: 500,
      };
    }
  }

  /**
   * Create new auto adjust amount
   */
  async createAutoAdjustAmount(createData: AutoAdjustAmountCreate): Promise<{
    status: boolean;
    message: string;
    data?: AutoAdjustAmount;
    statuscode?: number;
  }> {
    try {
      // Validate amount
      if (createData.amount < 0) {
        return {
          status: false,
          message: "Amount must be a positive number",
          statuscode: 400,
        };
      }

      const connection = await getDbConnection();

      if (!connection) {
        return {
          status: false,
          message: "Database connection failed",
          statuscode: 500,
        };
      }

      // Insert new record
      const insertQuery = "INSERT INTO auto_adjust_amount (amount) VALUES (?)";
      const [insertResult] = await connection.execute(insertQuery, [
        createData.amount,
      ]);

      // Get the inserted record
      const selectQuery =
        "SELECT id, amount FROM auto_adjust_amount ORDER BY id DESC LIMIT 1";
      const [rows] = await connection.execute(selectQuery);

      await connection.end();

      if (!Array.isArray(rows) || rows.length === 0) {
        return {
          status: false,
          message: "Failed to retrieve created auto adjust amount",
          statuscode: 500,
        };
      }

      const result = rows[0] as any;
      const autoAdjustAmount: AutoAdjustAmount = {
        id: result.id,
        amount: parseFloat(result.amount),
      };

      return {
        status: true,
        message: "Auto adjust amount created successfully",
        data: autoAdjustAmount,
      };
    } catch (error) {
      console.error("Error creating auto adjust amount:", error);
      return {
        status: false,
        message: "Internal server error while creating auto adjust amount",
        statuscode: 500,
      };
    }
  }

  /**
   * Delete auto adjust amount by ID
   */
  async deleteAutoAdjustAmount(id: number): Promise<{
    status: boolean;
    message: string;
    statuscode?: number;
  }> {
    try {
      const connection = await getDbConnection();

      if (!connection) {
        return {
          status: false,
          message: "Database connection failed",
          statuscode: 500,
        };
      }

      // First check if the record exists
      const checkQuery = "SELECT id FROM auto_adjust_amount WHERE id = ?";
      const [checkRows] = await connection.execute(checkQuery, [id]);

      if (!Array.isArray(checkRows) || checkRows.length === 0) {
        await connection.end();
        return {
          status: false,
          message: "Auto adjust amount not found",
          statuscode: 404,
        };
      }

      // Delete the record
      const deleteQuery = "DELETE FROM auto_adjust_amount WHERE id = ?";
      await connection.execute(deleteQuery, [id]);

      await connection.end();

      return {
        status: true,
        message: "Auto adjust amount deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting auto adjust amount:", error);
      return {
        status: false,
        message: "Internal server error while deleting auto adjust amount",
        statuscode: 500,
      };
    }
  }
}
