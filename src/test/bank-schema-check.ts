// Test script to check bank schema
import mysql from "mysql2/promise";
import { env } from "../config/env.js";

async function checkBankSchema() {
  console.log("🔍 Checking bank schema...");
  
  try {
    const connection = await mysql.createConnection({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    });

    // Check table structure
    const [rows] = await connection.execute("DESCRIBE banks");
    console.log("📊 Banks table structure:");
    console.table(rows);

    // Check existing data
    const [data] = await connection.execute("SELECT * FROM banks LIMIT 3");
    console.log("📋 Sample data:");
    console.table(data);

    // Check constraints
    const [constraints] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        CONSTRAINT_TYPE
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'banks' 
      AND TABLE_SCHEMA = ?
    `, [env.DB_NAME]);
    
    console.log("🔒 Constraints:");
    console.table(constraints);

    await connection.end();
    console.log("✅ Schema check completed");
  } catch (error) {
    console.error("❌ Schema check failed:", error);
  }
}

checkBankSchema();
