import { app } from "./app.js";
import MongoDBConnection from "./config/mongodb.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Try to initialize MongoDB connection (optional)
    try {
      await MongoDBConnection.getInstance().connect();
      console.log("MongoDB connection established");
    } catch (mongoError: any) {
      console.warn(
        "MongoDB connection failed, server will continue without MongoDB:",
        mongoError.message,
      );
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        `Swagger documentation available at http://localhost:${PORT}/api-docs`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await MongoDBConnection.getInstance().disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await MongoDBConnection.getInstance().disconnect();
  process.exit(0);
});

startServer();
