import type { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwt.service.js";
import { UserService } from "../services/user.service.js";
import type { UserSecurityFlagResponse } from "../types/user.types.js";

/**
 * Middleware to filter Swagger documentation based on user guest status
 * Hides POST/PUT/DELETE endpoints from guest users (is_guest = 1)
 */
export async function swaggerGuestFilterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      // No token provided - show full documentation (for unauthenticated viewing)
      return next();
    }

    // Verify JWT token
    const jwtService = new JwtService();
    const decodedToken = jwtService.verifyToken(token);

    if (!decodedToken || !decodedToken.userId) {
      // Invalid token - show full documentation
      return next();
    }

    // Get user security flags to check is_guest status
    const userService = new UserService();

    try {
      const securityResult: UserSecurityFlagResponse =
        await userService.getUserSecurityFlagByUserId(decodedToken.userId);

      if (!securityResult.status || !securityResult.data) {
        // Unable to verify user permissions - show full documentation
        return next();
      }

      const userSecurity = Array.isArray(securityResult.data)
        ? securityResult.data[0]
        : securityResult.data;

      // Check if user is a guest (is_guest = 1)
      if (userSecurity.is_guest === 1) {
        // User is a guest - modify Swagger spec to hide write operations
        console.log(
          `🔒 Guest user detected: userId=${decodedToken.userId}, filtering Swagger documentation`,
        );
        return modifySwaggerForGuest(req, res, next);
      }

      // User is not a guest - show full documentation
      console.log(
        `✅ Regular user detected: userId=${decodedToken.userId}, showing full Swagger documentation`,
      );
      next();
    } catch (error: any) {
      console.error(
        "Error checking user security flags for Swagger filter:",
        error,
      );
      // On error, show full documentation
      next();
    }
  } catch (error: any) {
    console.error("Swagger guest filter middleware error:", error);
    // On error, show full documentation
    next();
  }
}

/**
 * Helper function to filter Swagger spec for guest users
 * Removes POST/PUT/DELETE endpoints and adds a notice
 */
export function filterSwaggerSpecForGuest(spec: any): any {
  if (!spec || typeof spec !== "object" || !spec.paths) {
    return spec;
  }

  // Create a deep copy to avoid mutating the original
  const filteredSpec = JSON.parse(JSON.stringify(spec));

  // Filter out POST, PUT, DELETE endpoints
  const filteredPaths: any = {};

  for (const [path, pathItem] of Object.entries(filteredSpec.paths)) {
    const filteredPathItem: any = {};

    for (const [method, operation] of Object.entries(pathItem as any)) {
      // Only keep GET methods for guests
      if (method.toLowerCase() === "get") {
        filteredPathItem[method] = operation;
      }
    }

    // Only include the path if it has GET methods
    if (Object.keys(filteredPathItem).length > 0) {
      filteredPaths[path] = filteredPathItem;
    }
  }

  // Replace paths with filtered ones
  filteredSpec.paths = filteredPaths;

  // Add a note for guest users
  if (filteredSpec.info) {
    filteredSpec.info.description =
      (filteredSpec.info.description || "") +
      "\n\n**🔒 Guest User Access**\n" +
      "You are viewing this documentation as a guest user. " +
      "POST, PUT, and DELETE operations are hidden. " +
      "Please contact your administrator for full access.";
  }

  return filteredSpec;
}

/**
 * Modify Swagger specification to hide POST/PUT/DELETE endpoints for guests
 */
function modifySwaggerForGuest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Store the original res.json method
  const originalJson = res.json;

  // Override res.json to modify the Swagger spec before sending
  res.json = function (data: any) {
    const filteredData = filterSwaggerSpecForGuest(data);
    // Call the original json method with modified data
    return originalJson.call(this, filteredData);
  };

  next();
}
