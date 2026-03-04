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
import fastTagRoutes from "./routes/fasttag.routes.js";
import userSubscriptionRoutes from "./routes/user-subscription.routes.js";
import debugRoutes from "./routes/debug.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { swaggerAuthMiddleware } from "./middleware/swagger-auth.middleware.js";
import {
  swaggerGuestFilterMiddleware,
  filterSwaggerSpecForGuest,
} from "./middleware/swagger-guest-filter.middleware.js";
import { swaggerSpec, swaggerUi } from "./config/swagger.js";

export const app = express();

app.use(
  cors({
    origin: [
      "https://rtovehicalsearch.transcologistic.in",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
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
app.use("/api/fasttag", fastTagRoutes);
app.use("/api/user-subscriptions", userSubscriptionRoutes);

// Debug routes for testing
app.use("/api/debug", debugRoutes);

// Versioned routes
app.use("/api/v1/rc", rcV1Routes);
app.use("/api/v2/rc", rcV2Routes);
// Serve the raw OpenAPI JSON with guest filtering
app.get("/swagger.json", swaggerGuestFilterMiddleware, (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(swaggerSpec);
});

// Unprotected Swagger documentation for testing
app.use(
  "/api-docs-test",
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
    customSiteTitle: "RTO Vehicle API Documentation - Testing",
  }),
);

// Swagger documentation (protected) - with dynamic spec generation
app.get("/api-docs", swaggerAuthMiddleware, async (req, res, next) => {
  try {
    const { JwtService } = await import("./services/jwt.service.js");
    const { UserService } = await import("./services/user.service.js");

    // Check for Authorization header or cookie
    const authHeader = req.headers.authorization;
    const cookieHeader = req.headers.cookie;
    let token = null;

    // Try to get token from Authorization header first
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    // If not in header, try to get from cookie
    else if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      token = cookies["swagger_token"];
    }

    let isGuest = false;

    if (token) {
      try {
        const jwtService = new JwtService();
        const decodedToken = jwtService.verifyToken(token);

        if (decodedToken && decodedToken.userId) {
          const userService = new UserService();
          const securityResult = await userService.getUserSecurityFlagByUserId(
            decodedToken.userId,
          );

          if (securityResult.status && securityResult.data) {
            const userSecurity = Array.isArray(securityResult.data)
              ? securityResult.data[0]
              : securityResult.data;

            if (userSecurity.is_guest === 1) {
              isGuest = true;
              console.log(
                `🔒 Guest user detected: userId=${decodedToken.userId}, filtering Swagger documentation`,
              );
            } else {
              console.log(
                `✅ Regular user detected: userId=${decodedToken.userId}, showing full Swagger documentation`,
              );
            }
          }
        }
      } catch (error) {
        console.error("Error checking guest status:", error);
      }
    }

    // Generate the appropriate spec
    const spec = isGuest ? filterSwaggerSpecForGuest(swaggerSpec) : swaggerSpec;

    // Serve Swagger UI with the filtered/full spec
    const swaggerUiHandler = swaggerUi.setup(spec, {
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
      customSiteTitle: "RTO Vehicle API Documentation - Protected",
    });

    swaggerUiHandler(req, res, next);
  } catch (error) {
    console.error("Error in Swagger docs handler:", error);
    next(error);
  }
});

// Serve Swagger UI assets
app.use("/api-docs", swaggerUi.serve);

app.use(errorMiddleware);
