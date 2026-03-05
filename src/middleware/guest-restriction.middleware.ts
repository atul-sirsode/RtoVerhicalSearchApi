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

    // If no token, allow the request (restriction only applies to is_guest=1)
    if (!token) {
      return next();
    }

    // Verify JWT token
    const jwtService = new JwtService();
    const decodedToken = jwtService.verifyToken(token);

    // If token is invalid, allow the request (let auth middleware handle it)
    if (!decodedToken || !decodedToken.userId) {
      return next();
    }

    // Get user security flags to check is_guest status
    const userService = new UserService();

    // Use the correct method to get user security flags by user ID
    userService
      .getUserSecurityFlagByUserId(decodedToken.userId)
      .then((securityResult: UserSecurityFlagResponse) => {
        // If unable to get security flags, allow the request (not a guest restriction issue)
        if (!securityResult.status || !securityResult.data) {
          return next();
        }

        const userSecurity = Array.isArray(securityResult.data)
          ? securityResult.data[0]
          : securityResult.data;

        // ONLY restrict if user is explicitly a guest (is_guest = 1)
        if (userSecurity.is_guest === 1) {
          return res.status(403).json({
            status: false,
            message:
              "Guest users are not allowed to perform write operations. Please contact administrator for access.",
            statuscode: 403,
          });
        }

        // User is not a guest (is_guest = 0 or any other value), allow all operations
        next();
      })
      .catch((error: any) => {
        console.error("Error checking user security flags:", error);
        // On error, allow the request (don't block non-guest users due to errors)
        next();
      });
  } catch (error: any) {
    console.error("Guest restriction middleware error:", error);
    // On error, allow the request (don't block non-guest users due to errors)
    next();
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
