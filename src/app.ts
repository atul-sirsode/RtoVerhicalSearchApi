import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import rcRoutes from "./routes/rc.routes.js";
import rcV1Routes from "./routes/rc.v1.routes.js";
import rcV2Routes from "./routes/rc.v2.routes.js";
import fileHistoryRoutes from "./routes/file-history.routes.js";
import statesCitiesRoutes from "./routes/states-cities.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { swaggerSpec, swaggerUi } from "./config/swagger.js";

export const app = express();

app.use(
  cors({
    origin: [
      "https://rtovehicalsearch.transcologistic.in",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Original routes
app.use("/api/auth", authRoutes);
app.use("/api/rc", rcRoutes);
app.use("/api/file-history", fileHistoryRoutes);
app.use("/api/states-cities", statesCitiesRoutes);

// Versioned routes
app.use("/api/v1/rc", rcV1Routes);
app.use("/api/v2/rc", rcV2Routes);

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: "none",
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .scheme-container { margin: 20px 0 }
    `,
    customSiteTitle: "RTO Vehicle API Documentation",
  }),
);

app.use(errorMiddleware);
