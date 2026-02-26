import type { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwt.service.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Middleware to protect Swagger documentation
 * Shows login dialog for unauthenticated users instead of JSON errors
 */
export function swaggerAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
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

    if (!token) {
      // Serve the login HTML page instead of JSON error
      const loginPagePath = path.join(
        process.cwd(),
        "src",
        "public",
        "swagger-login.html",
      );

      fs.readFile(loginPagePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading login page:", err);
          return res.status(500).json({
            status: false,
            message: "Internal server error during authentication.",
            error: "AUTH_ERROR",
          });
        }

        res.setHeader("Content-Type", "text/html");
        res.status(401).send(data);
      });
      return;
    }

    // Token is already extracted above, no need to extract again

    // Verify JWT token
    const jwtService = new JwtService();
    const decodedToken = jwtService.verifyToken(token);

    if (!decodedToken) {
      // Serve login page for invalid token
      const loginPagePath = path.join(
        process.cwd(),
        "src",
        "public",
        "swagger-login.html",
      );

      fs.readFile(loginPagePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading login page:", err);
          return res.status(500).json({
            status: false,
            message: "Internal server error during authentication.",
            error: "AUTH_ERROR",
          });
        }

        res.setHeader("Content-Type", "text/html");
        res.status(401).send(data);
      });
      return;
    }

    // Optional: Check if user has admin rights
    // You can uncomment this section if you want to restrict access to admin users only
    /*
    // Check if user is admin (this would require database query)
    const userService = new UserService();
    const securityFlags = await userService.getUserSecurityFlags({ user_id: decodedToken.userId });
    
    if (!securityFlags.status || !securityFlags.data || securityFlags.data[0]?.is_admin !== 1) {
      // Serve login page with insufficient permissions message
      const loginPagePath = path.join(process.cwd(), 'src', 'public', 'swagger-login.html');
      
      fs.readFile(loginPagePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading login page:', err);
          return res.status(500).json({
            status: false,
            message: "Internal server error during authentication.",
            error: "AUTH_ERROR"
          });
        }
        
        // Modify the HTML to show insufficient permissions message
        const modifiedHtml = data.replace(
          '<div class="info-message">',
          '<div class="error-message" style="background: #fee; color: #c53030; border-left: 4px solid #c53030;">'
        ).replace(
          '<strong>Authentication Required</strong>',
          '<strong>Access Denied</strong>'
        ).replace(
          'Please enter your User ID and Password to access the Swagger documentation.',
          'You do not have sufficient privileges to access the API documentation. Admin access required.'
        );
        
        res.setHeader('Content-Type', 'text/html');
        res.status(403).send(modifiedHtml);
      });
      return;
    }
    */

    // Add user info to request for potential logging
    (req as any).user = decodedToken;

    console.log(
      `🔐 Swagger API docs accessed by userId: ${decodedToken.userId}, email: ${decodedToken.email}`,
    );

    // User is authenticated, proceed to Swagger docs
    next();
  } catch (error) {
    console.error("Swagger auth middleware error:", error);

    // Serve login page for any errors
    const loginPagePath = path.join(
      process.cwd(),
      "src",
      "public",
      "swagger-login.html",
    );

    fs.readFile(loginPagePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading login page:", err);
        return res.status(500).json({
          status: false,
          message: "Internal server error during authentication.",
          error: "AUTH_ERROR",
        });
      }

      res.setHeader("Content-Type", "text/html");
      res.status(500).send(data);
    });
  }
}
