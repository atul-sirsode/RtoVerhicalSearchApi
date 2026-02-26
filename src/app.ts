import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import rcRoutes from "./routes/rc.routes.js";
import rcV1Routes from "./routes/rc.v1.routes.js";
import rcV2Routes from "./routes/rc.v2.routes.js";
import fileHistoryRoutes from "./routes/file-history.routes.js";
import statesCitiesRoutes from "./routes/states-cities.routes.js";
import tollGuruRoutes from "./routes/tollguru.routes.js";
import userRoutes from "./routes/user.routes.js";
import permissionsRoutes from "./routes/permissions.routes.js";
import rolesRoutes from "./routes/roles.routes.js";
import banksRoutes from "./routes/banks.routes.js";
import userPermissionsRoutes from "./routes/user-permissions.routes.js";
import rolePermissionsRoutes from "./routes/role-permissions.routes.js";
import userRolesRoutes from "./routes/user-roles.routes.js";
import userSecurityFlagsRoutes from "./routes/user-security-flags.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { swaggerAuthMiddleware } from "./middleware/swagger-auth.middleware.js";
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
app.use("/api/tollguru", tollGuruRoutes);
app.use("/api/users", userRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/banks", banksRoutes);
app.use("/api/user-permissions", userPermissionsRoutes);
app.use("/api/role-permissions", rolePermissionsRoutes);
app.use("/api/user-roles", userRolesRoutes);
app.use("/api/user-security-flags", userSecurityFlagsRoutes);

// Versioned routes
app.use("/api/v1/rc", rcV1Routes);
app.use("/api/v2/rc", rcV2Routes);
// Serve the raw OpenAPI JSON
app.get("/swagger.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(swaggerSpec);
});
// Swagger documentation (protected)
app.use(
  "/api-docs",
  swaggerAuthMiddleware,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      url: "/swagger.json",
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
    customSiteTitle: "RTO Vehicle API Documentation - Protected",
  }),
);

app.use(errorMiddleware);
