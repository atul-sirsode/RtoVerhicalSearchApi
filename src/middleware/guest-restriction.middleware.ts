import type { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwt.service.js";
import { UserService } from "../services/user.service.js";
import type { UserSecurityFlagResponse } from "../types/user.types.js";

/**
 * Middleware to restrict POST/PUT/DELETE endpoints for guest users (is_guest = 1)
 * Only allows GET requests for guest users
 */
export function guestRestrictionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Skip restriction for GET requests
    if (req.method === "GET") {
      return next();
    }

    // Check for Authorization header
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Authentication required for this operation",
        statuscode: 401,
      });
    }

    // Verify JWT token
    const jwtService = new JwtService();
    const decodedToken = jwtService.verifyToken(token);

    if (!decodedToken || !decodedToken.userId) {
      return res.status(401).json({
        status: false,
        message: "Invalid token or missing user information",
        statuscode: 401,
      });
    }

    // Get user security flags to check is_guest status
    const userService = new UserService();

    // Use the correct method to get user security flags by user ID
    userService
      .getUserSecurityFlagByUserId(decodedToken.userId)
      .then((securityResult: UserSecurityFlagResponse) => {
        if (!securityResult.status || !securityResult.data) {
          return res.status(403).json({
            status: false,
            message: "Unable to verify user permissions",
            statuscode: 403,
          });
        }

        const userSecurity = Array.isArray(securityResult.data)
          ? securityResult.data[0]
          : securityResult.data;

        // Check if user is a guest (is_guest = 1)
        if (userSecurity.is_guest === 1) {
          return res.status(403).json({
            status: false,
            message:
              "Guest users are not allowed to perform write operations. Please contact administrator for access.",
            statuscode: 403,
          });
        }

        // User is not a guest, allow the operation
        next();
      })
      .catch((error: any) => {
        console.error("Error checking user security flags:", error);
        return res.status(500).json({
          status: false,
          message: "Error verifying user permissions",
          statuscode: 500,
        });
      });
  } catch (error: any) {
    console.error("Guest restriction middleware error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error during permission check",
      statuscode: 500,
    });
  }
}

/**
 * Middleware to apply guest restriction only to specific HTTP methods
 * @param allowedMethods - Array of allowed HTTP methods (default: ['GET'])
 */
export function createGuestRestriction(allowedMethods: string[] = ["GET"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Allow requests with methods in the allowed list
    if (allowedMethods.includes(req.method)) {
      return next();
    }

    // Apply guest restriction for other methods
    return guestRestrictionMiddleware(req, res, next);
  };
}
