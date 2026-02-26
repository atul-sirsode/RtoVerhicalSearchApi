import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const DEFAULT_SECRET_KEY =
  process.env.JWT_SECRET ||
  "UTA5U1VEQXdNREF5TXprMVQwUnJORTE2VlRGT2FsVXhUVkU5UFE9PQ==";
const DEFAULT_PARTNER_ID = process.env.PARTNER_ID || "CORP00002395";

export interface JwtPayload {
  timestamp: number;
  partnerId: string;
  reqid: number;
  userId?: number;
  email?: string;
}

export interface JwtTokenResponse {
  token: string;
  payload: JwtPayload;
}

export class JwtService {
  /**
   * Generate JWT token using user-specific secret and partner ID
   */
  generateToken(
    userJwtSecret?: string | null,
    userPartnerId?: string | null,
    userId?: number,
    email?: string,
  ): JwtTokenResponse {
    const currentTimestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 9999999) + 1;

    // Use user-specific values if available, otherwise fall back to defaults
    const secretKey = userJwtSecret || DEFAULT_SECRET_KEY;
    const partnerId = userPartnerId || DEFAULT_PARTNER_ID;

    const payload: JwtPayload = {
      timestamp: currentTimestamp,
      partnerId: partnerId || DEFAULT_PARTNER_ID,
      reqid: randomNumber,
    };

    // Add optional properties if provided
    if (userId !== undefined) {
      payload.userId = userId;
    }
    if (email !== undefined) {
      payload.email = email;
    }

    const token = jwt.sign(payload, secretKey, {
      algorithm: "HS256",
      expiresIn: "24h", // Token expires in 24 hours
    });

    return {
      token,
      payload,
    };
  }

  /**
   * Verify JWT token using user-specific secret
   */
  verifyToken(token: string, userJwtSecret?: string | null): JwtPayload | null {
    try {
      const secretKey = userJwtSecret || DEFAULT_SECRET_KEY;
      const decoded = jwt.verify(token, secretKey) as any;

      // Ensure the decoded payload matches JwtPayload structure
      if (
        decoded &&
        typeof decoded === "object" &&
        "timestamp" in decoded &&
        "partnerId" in decoded &&
        "reqid" in decoded
      ) {
        return decoded as JwtPayload;
      }

      return null;
    } catch (error) {
      console.error("JWT verification failed:", error);
      return null;
    }
  }

  /**
   * Decode JWT token without verification (for debugging)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      return decoded;
    } catch (error) {
      console.error("JWT decoding failed:", error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true; // No expiration claim
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error("Token expiration check failed:", error);
      return true;
    }
  }

  /**
   * Generate refresh token (longer-lived token)
   */
  generateRefreshToken(
    userJwtSecret?: string | null,
    userPartnerId?: string | null,
    userId?: number,
  ): JwtTokenResponse {
    const currentTimestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 9999999) + 1;

    const secretKey = userJwtSecret || DEFAULT_SECRET_KEY;
    const partnerId = userPartnerId || DEFAULT_PARTNER_ID;

    const payload: JwtPayload = {
      timestamp: currentTimestamp,
      partnerId: partnerId || DEFAULT_PARTNER_ID,
      reqid: randomNumber,
    };

    // Add optional properties if provided
    if (userId !== undefined) {
      payload.userId = userId;
    }

    const token = jwt.sign(payload, secretKey, {
      algorithm: "HS256",
      expiresIn: "7d", // Refresh token expires in 7 days
    });

    return {
      token,
      payload,
    };
  }

  /**
   * Generate API token for external service calls
   */
  generateApiToken(
    userJwtSecret?: string | null,
    userPartnerId?: string | null,
  ): JwtTokenResponse {
    const currentTimestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 9999999) + 1;

    const secretKey = userJwtSecret || DEFAULT_SECRET_KEY;
    const partnerId = userPartnerId || DEFAULT_PARTNER_ID;

    const payload: JwtPayload = {
      timestamp: currentTimestamp,
      partnerId: partnerId || DEFAULT_PARTNER_ID,
      reqid: randomNumber,
    };

    const token = jwt.sign(payload, secretKey, {
      algorithm: "HS256",
      expiresIn: "1h", // API token expires in 1 hour
    });

    return {
      token,
      payload,
    };
  }
}
