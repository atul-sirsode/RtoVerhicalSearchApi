import { Router } from "express";
import { JwtService } from "../services/jwt.service.js";
import { UserService } from "../services/user.service.js";

const router = Router();
const jwtService = new JwtService();
const userService = new UserService();

/**
 * Debug endpoint to check user permissions and guest status
 */
router.get("/check-user", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        status: false,
        message: "No authorization header found",
        data: null,
      });
    }

    const token = authHeader.substring(7);
    const decodedToken = jwtService.verifyToken(token);

    if (!decodedToken || !decodedToken.userId) {
      return res.json({
        status: false,
        message: "Invalid or expired token",
        data: { decodedToken },
      });
    }

    // Get user security flags
    const securityResult = await userService.getUserSecurityFlagByUserId(
      decodedToken.userId,
    );

    return res.json({
      status: true,
      message: "User information retrieved",
      data: {
        decodedToken: {
          userId: decodedToken.userId,
          email: decodedToken.email,
          partnerId: decodedToken.partnerId,
        },
        securityFlags: securityResult.status ? securityResult.data : null,
        isGuest:
          securityResult.status &&
          securityResult.data &&
          "is_guest" in securityResult.data
            ? securityResult.data.is_guest
            : "unknown",
      },
    });
  } catch (error: any) {
    console.error("Debug check user error:", error);
    return res.status(500).json({
      status: false,
      message: "Error checking user",
      error: error.message,
    });
  }
});

/**
 * Debug endpoint to test Swagger filtering
 */
router.get("/test-swagger-filter", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        status: false,
        message: "No authorization header found - showing full Swagger",
        filtered: false,
      });
    }

    const token = authHeader.substring(7);
    const decodedToken = jwtService.verifyToken(token);

    if (!decodedToken || !decodedToken.userId) {
      return res.json({
        status: false,
        message: "Invalid token - showing full Swagger",
        filtered: false,
      });
    }

    const securityResult = await userService.getUserSecurityFlagByUserId(
      decodedToken.userId,
    );

    if (!securityResult.status || !securityResult.data) {
      return res.json({
        status: false,
        message: "Could not verify user permissions - showing full Swagger",
        filtered: false,
      });
    }

    const userSecurity = Array.isArray(securityResult.data)
      ? securityResult.data[0]
      : securityResult.data;

    const isGuest =
      userSecurity && "is_guest" in userSecurity
        ? userSecurity.is_guest === 1
        : false;

    return res.json({
      status: true,
      message: `User is ${isGuest ? "GUEST" : "REGULAR"} - Swagger should be ${isGuest ? "FILTERED" : "FULL"}`,
      filtered: isGuest,
      userData: {
        userId: decodedToken.userId,
        email: decodedToken.email,
        isGuest:
          userSecurity && "is_guest" in userSecurity
            ? userSecurity.is_guest
            : "unknown",
        isAdmin:
          userSecurity && "is_admin" in userSecurity
            ? userSecurity.is_admin
            : "unknown",
        bypassOtp:
          userSecurity && "bypass_otp" in userSecurity
            ? userSecurity.bypass_otp
            : "unknown",
      },
    });
  } catch (error: any) {
    console.error("Debug test swagger filter error:", error);
    return res.status(500).json({
      status: false,
      message: "Error testing Swagger filter",
      error: error.message,
    });
  }
});

export default router;
