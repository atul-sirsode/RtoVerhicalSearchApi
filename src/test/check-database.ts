import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function checkDatabase() {
  console.log("🔍 Checking database connection and tables...");

  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "test",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log("✅ Database connection successful");

    // Check if user_subscriptions table exists
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'user_subscriptions'",
    );
    console.log(
      "📋 Tables check:",
      (tables as any[]).length > 0 ? "Table exists" : "Table NOT found",
    );

    if ((tables as any[]).length === 0) {
      console.log("🔧 Creating user_subscriptions table...");

      const createTableQuery = `
        CREATE TABLE user_subscriptions (
          id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          start_date DATE NOT NULL,
          validity_days INT NOT NULL DEFAULT 30,
          end_date DATE NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY username (username)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;

      await pool.execute(createTableQuery);
      console.log("✅ Table created successfully");
    }

    // Test a simple query
    const [result] = await pool.execute(
      "SELECT COUNT(*) as count FROM user_subscriptions",
    );
    console.log("📊 Current records:", (result as any)[0].count);

    await pool.end();
    console.log("🎉 Database check completed successfully");
  } catch (error) {
    console.error("❌ Database error:", error);
  }
}

checkDatabase();
