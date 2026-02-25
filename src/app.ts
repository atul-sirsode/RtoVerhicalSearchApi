import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import rcRoutes from "./routes/rc.routes.js";
import rcV1Routes from "./routes/rc.v1.routes.js";
import rcV2Routes from "./routes/rc.v2.routes.js";
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

// Original routes
app.use("/api/auth", authRoutes);
app.use("/api/rc", rcRoutes);
app.use("/api/file-history", fileHistoryRoutes);

// Versioned routes
app.use("/api/v1/rc", rcV1Routes);
app.use("/api/v2/rc", rcV2Routes);

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorMiddleware);
