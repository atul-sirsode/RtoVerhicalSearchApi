import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import rcRoutes from "./routes/rc.routes.js";
import fileHistoryRoutes from "./routes/file-history.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { swaggerSpec, swaggerUi } from "./config/swagger.js";

export const app = express();

app.use(
  cors({
    origin: "https://rtovehicalsearch.transcologistic.in",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/rc", rcRoutes);
app.use("/api/file-history", fileHistoryRoutes);
// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorMiddleware);
