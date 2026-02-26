import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";
import type {
  GetUserInfoRequest,
  LoginRequest,
  LoginResponse,
  GetUserPermissionsRequest,
  UserApiResponse,
  // CRUD Types
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  DeletePermissionRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  DeleteRoleRequest,
  Permission,
  Role,
  // Bank and Relationship Types
  CreateBankRequest,
  UpdateBankRequest,
  DeleteBankRequest,
  BankResponse,
  BanksResponse,
  CreateUserPermissionRequest,
  UpdateUserPermissionRequest,
  DeleteUserPermissionRequest,
  UserPermissionResponse,
  UserPermissionsResponse,
  CreateRolePermissionRequest,
  UpdateRolePermissionRequest,
  DeleteRolePermissionRequest,
  RolePermissionResponse,
  RolePermissionsResponse,
  CreateUserRoleRequest,
  DeleteUserRoleRequest,
  UserRoleResponse,
  UserRolesResponse,
  CreateUserSecurityFlagRequest,
  UpdateUserSecurityFlagRequest,
  DeleteUserSecurityFlagRequest,
  UserSecurityFlagResponse,
  UserSecurityFlagsResponse,
} from "../types/user.types.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: "transcologistic0011@gmail.com"
 *         password:
 *           type: string
 *           description: User password
 *           example: "password123"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 123
 *         username:
 *           type: string
 *           description: Username
 *           example: "transcologistic0011"
 *         display_name:
 *           type: string
 *           description: Display name
 *           example: "Transco Logistic"
 *         email:
 *           type: string
 *           description: Email address
 *           example: "transcologistic0011@gmail.com"
 *         is_active:
 *           type: integer
 *           description: User active status (1 = active, 0 = inactive)
 *           example: 1
 *         is_admin:
 *           type: integer
 *           description: Admin access flag (1 = admin, 0 = regular user)
 *           example: 0
 *         bypass_otp:
 *           type: integer
 *           description: OTP bypass flag (1 = bypass, 0 = require OTP)
 *           example: 0
 *         jwt_secret:
 *           type: string
 *           description: JWT secret for token generation
 *           example: "your-jwt-secret-key"
 *           nullable: true
 *         partner_id:
 *           type: string
 *           description: Partner ID for integration
 *           example: "partner-123"
 *           nullable: true
 *         token:
 *           type: string
 *           description: Authentication token (optional)
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         last_login:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *           example: "2024-01-01T10:00:00Z"
 *     GetUserInfoRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: "transcologistic0011@gmail.com"
 *     GetUserInfoResponse:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 123
 *         username:
 *           type: string
 *           description: Username
 *           example: "transcologistic0011"
 *         display_name:
 *           type: string
 *           description: Display name
 *           example: "Transco Logistic"
 *         email:
 *           type: string
 *           description: Email address
 *           example: "transcologistic0011@gmail.com"
 *         is_active:
 *           type: integer
 *           description: User active status (1 = active, 0 = inactive)
 *           example: 1
 *         is_admin:
 *           type: integer
 *           description: Admin access flag (1 = admin, 0 = regular user)
 *           example: 0
 *         bypass_otp:
 *           type: integer
 *           description: OTP bypass flag (1 = bypass, 0 = require OTP)
 *           example: 0
 *         jwt_secret:
 *           type: string
 *           description: JWT secret for token generation
 *           example: "your-jwt-secret-key"
 *           nullable: true
 *         partner_id:
 *           type: string
 *           description: Partner ID for integration
 *           example: "partner-123"
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     PermissionWithStatus:
 *       type: object
 *       properties:
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 *           example: 1
 *         perm_key:
 *           type: string
 *           description: Permission key
 *           example: "menu.rc_verification"
 *         perm_name:
 *           type: string
 *           description: Permission display name
 *           example: "RC Verification"
 *         category:
 *           type: string
 *           description: Permission category
 *           example: "Menu"
 *         is_allowed:
 *           type: integer
 *           description: Permission status (1 = allowed, 0 = denied)
 *           example: 1
 *     GetUserPermissionsResponse:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 123
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PermissionWithStatus'
 *           description: User permissions list
 *         security_flags:
 *           type: object
 *           properties:
 *             is_admin:
 *               type: integer
 *               description: Admin access flag
 *               example: 0
 *             bypass_otp:
 *               type: integer
 *               description: OTP bypass flag
 *               example: 0
 *     UserApiResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           description: Request status
 *           example: true
 *         message:
 *           type: string
 *           description: Response message
 *           example: "User information retrieved successfully"
 *         data:
 *           description: Response data (varies by endpoint)
 *         statuscode:
 *           type: integer
 *           description: HTTP status code
 *           example: 200
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login authentication
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Bad request - email and password required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserApiResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserApiResponse'
 */
export async function login(
  req: Request<{}, {}, LoginRequest>,
  res: Response<UserApiResponse>,
  next: NextFunction,
) {
  try {
    console.log("Login request body:", { email: req.body.email });

    const userService = new UserService();
    const result = await userService.login(req.body);

    if (!result.status) {
      const statusCode = result.statuscode || 500;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in login controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/users/get-user-info:
 *   post:
 *     summary: Get user information by email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetUserInfoRequest'
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User information retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/GetUserInfoResponse'
 *       400:
 *         description: Bad request - email is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserApiResponse'
 *       404:
 *         description: User not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserApiResponse'
 */
export async function getUserInfo(
  req: Request<{}, {}, GetUserInfoRequest>,
  res: Response<UserApiResponse>,
  next: NextFunction,
) {
  try {
    console.log("Get user info request body:", req.body);

    const userService = new UserService();
    const result = await userService.getUserInfo(req.body);

    if (!result.status) {
      const statusCode = result.statuscode || 500;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in getUserInfo controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/users/get-user-permissions:
 *   post:
 *     summary: Get user permissions and security flags by email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetUserInfoRequest'
 *     responses:
 *       200:
 *         description: User permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User permissions retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/GetUserPermissionsResponse'
 *       400:
 *         description: Bad request - email is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserApiResponse'
 *       404:
 *         description: User not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserApiResponse'
 */
export async function getUserPermissions(
  req: Request<{}, {}, GetUserPermissionsRequest>,
  res: Response<UserApiResponse>,
  next: NextFunction,
) {
  try {
    console.log("Get user permissions request body:", req.body);

    const userService = new UserService();
    const result = await userService.getUserPermissions(req.body);

    if (!result.status) {
      const statusCode = result.statuscode || 500;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in getUserPermissions controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/users/get-all-active-users:
 *   get:
 *     summary: Get all active users (admin only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Active users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Active users retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                         example: 123
 *                       username:
 *                         type: string
 *                         example: "transcologistic0011"
 *                       display_name:
 *                         type: string
 *                         example: "Transco Logistic"
 *                       email:
 *                         type: string
 *                         example: "transcologistic0011@gmail.com"
 *                       is_active:
 *                         type: integer
 *                         example: 1
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserApiResponse'
 */
export async function getAllActiveUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Get all active users request");

    const userService = new UserService();
    const users = await userService.getAllActiveUsers();

    res.json({
      status: true,
      message: "Active users retrieved successfully",
      data: users,
    });
  } catch (err) {
    console.error("Error in getAllActiveUsers controller:", err);
    next(err);
  }
}

// ==================== USER CRUD ENDPOINTS ====================

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - display_name
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username
 *                 example: "john_doe"
 *               display_name:
 *                 type: string
 *                 description: Display name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: Password
 *                 example: "securePassword123"
 *               is_active:
 *                 type: integer
 *                 description: User active status
 *                 example: 1
 *               jwt_secret:
 *                 type: string
 *                 description: JWT secret for user
 *                 example: "user-jwt-secret"
 *               partner_id:
 *                 type: string
 *                 description: Partner ID
 *                 example: "PARTNER-001"
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 123
 *                     username:
 *                       type: string
 *                       example: "john_doe"
 *                     display_name:
 *                       type: string
 *                       example: "John Doe"
 *       400:
 *         description: Bad request - validation error
 *       500:
 *         description: Internal server error
 */
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Create user request body:", req.body);

    const userService = new UserService();
    const result = await userService.createUser(req.body as CreateUserRequest);

    if (!result.status) {
      return res.status(result.statuscode || 500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in createUser controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Update an existing user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: User ID
 *                 example: 123
 *               username:
 *                 type: string
 *                 description: Username
 *                 example: "john_doe_updated"
 *               display_name:
 *                 type: string
 *                 description: Display name
 *                 example: "John Doe - Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: "john.updated@example.com"
 *               password:
 *                 type: string
 *                 description: New password
 *                 example: "newSecurePassword123"
 *               is_active:
 *                 type: integer
 *                 description: User active status
 *                 example: 1
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Update user request body:", req.body);

    const userService = new UserService();
    const result = await userService.updateUser(req.body as UpdateUserRequest);

    if (!result.status) {
      return res.status(result.statuscode || 500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in updateUser controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: Delete a user (soft delete)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: User ID to delete
 *                 example: 123
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Delete user request body:", req.body);

    const userService = new UserService();
    const result = await userService.deleteUser(req.body as DeleteUserRequest);

    if (!result.status) {
      return res.status(result.statuscode || 500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in deleteUser controller:", err);
    next(err);
  }
}

// ==================== PERMISSION CRUD ENDPOINTS ====================

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   permission_id:
 *                     type: integer
 *                     example: 1
 *                   perm_key:
 *                     type: string
 *                     example: "menu.rc_verification"
 *                   perm_name:
 *                     type: string
 *                     example: "RC Verification"
 *                   category:
 *                     type: string
 *                     example: "Menu"
 *                   description:
 *                     type: string
 *                     example: "Access to RC verification features"
 *       500:
 *         description: Internal server error
 */
export async function getAllPermissions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Get all permissions request");

    const userService = new UserService();
    const permissions = await userService.getAllPermissions();

    res.json({
      status: true,
      message: "Permissions retrieved successfully",
      data: permissions,
    });
  } catch (err) {
    console.error("Error in getAllPermissions controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/permissions/create:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - perm_key
 *               - perm_name
 *             properties:
 *               perm_key:
 *                 type: string
 *                 description: Permission key
 *                 example: "menu.analytics"
 *               perm_name:
 *                 type: string
 *                 description: Permission name
 *                 example: "Analytics Dashboard"
 *               category:
 *                 type: string
 *                 description: Permission category
 *                 example: "Menu"
 *               description:
 *                 type: string
 *                 description: Permission description
 *                 example: "Access to analytics and reporting features"
 *     responses:
 *       200:
 *         description: Permission created successfully
 *       400:
 *         description: Bad request - validation error
 *       500:
 *         description: Internal server error
 */
export async function createPermission(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Create permission request body:", req.body);

    const userService = new UserService();
    const result = await userService.createPermission(
      req.body as CreatePermissionRequest,
    );

    if (!result.status) {
      return res.status(result.statuscode || 500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in createPermission controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/permissions/update:
 *   put:
 *     summary: Update an existing permission
 *     tags: [Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission_id
 *             properties:
 *               permission_id:
 *                 type: integer
 *                 description: Permission ID
 *                 example: 1
 *               perm_key:
 *                 type: string
 *                 description: Permission key
 *                 example: "menu.analytics_updated"
 *               perm_name:
 *                 type: string
 *                 description: Permission name
 *                 example: "Analytics Dashboard - Updated"
 *               category:
 *                 type: string
 *                 description: Permission category
 *                 example: "Menu"
 *               description:
 *                 type: string
 *                 description: Permission description
 *                 example: "Updated description for analytics"
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
export async function updatePermission(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Update permission request body:", req.body);

    const userService = new UserService();
    const result = await userService.updatePermission(
      req.body as UpdatePermissionRequest,
    );

    if (!result.status) {
      return res.status(result.statuscode || 500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in updatePermission controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/permissions/delete:
 *   delete:
 *     summary: Delete a permission
 *     tags: [Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission_id
 *             properties:
 *               permission_id:
 *                 type: integer
 *                 description: Permission ID to delete
 *                 example: 1
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *       400:
 *         description: Bad request - permission is in use
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
export async function deletePermission(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Delete permission request body:", req.body);

    const userService = new UserService();
    const result = await userService.deletePermission(
      req.body as DeletePermissionRequest,
    );

    if (!result.status) {
      return res.status(result.statuscode || 500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in deletePermission controller:", err);
    next(err);
  }
}

// ==================== ROLE CRUD ENDPOINTS ====================

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   role_id:
 *                     type: integer
 *                     example: 1
 *                   role_key:
 *                     type: string
 *                     example: "admin"
 *                   role_name:
 *                     type: string
 *                     example: "Admin"
 *                   is_system_role:
 *                     type: integer
 *                     example: 1
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-02-26T12:45:57Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-02-26T12:45:57Z"
 *       500:
 *         description: Internal server error
 */
export async function getAllRoles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Get all roles request");

    const userService = new UserService();
    const roles = await userService.getAllRoles();

    res.json({
      status: true,
      message: "Roles retrieved successfully",
      data: roles,
    });
  } catch (err) {
    console.error("Error in getAllRoles controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/roles/create:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_key
 *               - role_name
 *             properties:
 *               role_key:
 *                 type: string
 *                 description: Role key
 *                 example: "manager"
 *               role_name:
 *                 type: string
 *                 description: Role name
 *                 example: "Manager"
 *               is_system_role:
 *                 type: integer
 *                 description: System role flag
 *                 example: 0
 *     responses:
 *       200:
 *         description: Role created successfully
 *       400:
 *         description: Bad request - validation error
 *       500:
 *         description: Internal server error
 */
export async function createRole(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Create role request body:", req.body);

    const userService = new UserService();
    const result = await userService.createRole(req.body as CreateRoleRequest);

    if (!result.status) {
      return res.status(result.statuscode || 500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in createRole controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/roles/update:
 *   put:
 *     summary: Update an existing role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *             properties:
 *               role_id:
 *                 type: integer
 *                 description: Role ID
 *                 example: 1
 *               role_key:
 *                 type: string
 *                 description: Role key
 *                 example: "manager_updated"
 *               role_name:
 *                 type: string
 *                 description: Role name
 *                 example: "Manager - Updated"
 *               is_system_role:
 *                 type: integer
 *                 description: System role flag
 *                 example: 0
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Bad request - validation error or system role protection
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
export async function updateRole(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Update role request body:", req.body);

    const userService = new UserService();
    const result = await userService.updateRole(req.body as UpdateRoleRequest);

    if (!result.status) {
      return res.status(result.statuscode || 500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in updateRole controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/roles/delete:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *             properties:
 *               role_id:
 *                 type: integer
 *                 description: Role ID to delete
 *                 example: 1
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Bad request - system role protection or role in use
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
export async function deleteRole(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Delete role request body:", req.body);

    const userService = new UserService();
    const result = await userService.deleteRole(req.body as DeleteRoleRequest);

    if (!result.status) {
      return res.status(result.statuscode || 500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in deleteRole controller:", err);
    next(err);
  }
}

// ==================== RELATIONSHIP TABLE SCHEMAS ====================

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPermission:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 *           example: 2
 *         is_allowed:
 *           type: integer
 *           description: Permission allowed flag (1 = allowed, 0 = denied)
 *           example: 1
 *         note:
 *           type: string
 *           description: Optional note
 *           example: null
 *           nullable: true
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2026-02-26T13:13:22Z"
 *     CreateUserPermissionRequest:
 *       type: object
 *       required:
 *         - user_id
 *         - permission_id
 *         - is_allowed
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 *           example: 2
 *         is_allowed:
 *           type: integer
 *           description: Permission allowed flag (1 = allowed, 0 = denied)
 *           example: 1
 *         note:
 *           type: string
 *           description: Optional note
 *           example: "Grant access to user management"
 *           nullable: true
 *     UpdateUserPermissionRequest:
 *       type: object
 *       required:
 *         - user_id
 *         - permission_id
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 *           example: 2
 *         is_allowed:
 *           type: integer
 *           description: Permission allowed flag (1 = allowed, 0 = denied)
 *           example: 0
 *         note:
 *           type: string
 *           description: Optional note
 *           example: "Revoke access to user management"
 *           nullable: true
 *     DeleteUserPermissionRequest:
 *       type: object
 *       required:
 *         - user_id
 *         - permission_id
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 *           example: 2
 *     RolePermission:
 *       type: object
 *       properties:
 *         role_id:
 *           type: integer
 *           description: Role ID
 *           example: 1
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 *           example: 1
 *         is_allowed:
 *           type: integer
 *           description: Permission allowed flag (1 = allowed, 0 = denied)
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2026-02-26T12:46:40Z"
 *     CreateRolePermissionRequest:
 *       type: object
 *       required:
 *         - role_id
 *         - permission_id
 *         - is_allowed
 *       properties:
 *         role_id:
 *           type: integer
 *           description: Role ID
 *           example: 1
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 *           example: 1
 *         is_allowed:
 *           type: integer
 *           description: Permission allowed flag (1 = allowed, 0 = denied)
 *           example: 1
 *     UpdateRolePermissionRequest:
 *       type: object
 *       required:
 *         - role_id
 *         - permission_id
 *       properties:
 *         role_id:
 *           type: integer
 *           description: Role ID
 *           example: 1
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 *           example: 1
 *         is_allowed:
 *           type: integer
 *           description: Permission allowed flag (1 = allowed, 0 = denied)
 *           example: 0
 *     DeleteRolePermissionRequest:
 *       type: object
 *       required:
 *         - role_id
 *         - permission_id
 *       properties:
 *         role_id:
 *           type: integer
 *           description: Role ID
 *           example: 1
 *         permission_id:
 *           type: integer
 *           description: Permission ID
 *           example: 1
 *     UserRole:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         role_id:
 *           type: integer
 *           description: Role ID
 *           example: 1
 *         assigned_at:
 *           type: string
 *           format: date-time
 *           description: Assignment timestamp
 *           example: "2026-02-26T12:46:51Z"
 *         assigned_by:
 *           type: integer
 *           description: User who made the assignment
 *           example: null
 *           nullable: true
 *     CreateUserRoleRequest:
 *       type: object
 *       required:
 *         - user_id
 *         - role_id
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         role_id:
 *           type: integer
 *           description: Role ID
 *           example: 2
 *         assigned_by:
 *           type: integer
 *           description: User who made the assignment
 *           example: 1
 *           nullable: true
 *     DeleteUserRoleRequest:
 *       type: object
 *       required:
 *         - user_id
 *         - role_id
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         role_id:
 *           type: integer
 *           description: Role ID
 *           example: 2
 *     UserSecurityFlag:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 2
 *         is_admin:
 *           type: integer
 *           description: Admin flag (1 = admin, 0 = regular user)
 *           example: 1
 *         bypass_otp:
 *           type: integer
 *           description: OTP bypass flag (1 = bypass, 0 = require OTP)
 *           example: 0
 *         mfa_enrolled:
 *           type: integer
 *           description: MFA enrollment flag (1 = enrolled, 0 = not enrolled)
 *           example: 0
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2026-02-26T12:49:35Z"
 *     CreateUserSecurityFlagRequest:
 *       type: object
 *       required:
 *         - user_id
 *         - is_admin
 *         - bypass_otp
 *         - mfa_enrolled
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         is_admin:
 *           type: integer
 *           description: Admin flag (1 = admin, 0 = regular user)
 *           example: 0
 *         bypass_otp:
 *           type: integer
 *           description: OTP bypass flag (1 = bypass, 0 = require OTP)
 *           example: 0
 *         mfa_enrolled:
 *           type: integer
 *           description: MFA enrollment flag (1 = enrolled, 0 = not enrolled)
 *           example: 1
 *     UpdateUserSecurityFlagRequest:
 *       type: object
 *       required:
 *         - user_id
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         is_admin:
 *           type: integer
 *           description: Admin flag (1 = admin, 0 = regular user)
 *           example: 1
 *         bypass_otp:
 *           type: integer
 *           description: OTP bypass flag (1 = bypass, 0 = require OTP)
 *           example: 1
 *         mfa_enrolled:
 *           type: integer
 *           description: MFA enrollment flag (1 = enrolled, 0 = not enrolled)
 *           example: 1
 *     DeleteUserSecurityFlagRequest:
 *       type: object
 *       required:
 *         - user_id
 *       properties:
 *         user_id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *     Bank:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Bank ID
 *           example: "HDFC"
 *         name:
 *           type: string
 *           description: Bank name
 *           example: "HDFC Bank"
 *         enabled:
 *           type: integer
 *           description: Bank enabled status (1 = enabled, 0 = disabled)
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2026-02-26T12:49:35Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2026-02-26T12:49:35Z"
 *     CreateBankRequest:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Bank ID
 *           example: "HDFC"
 *         name:
 *           type: string
 *           description: Bank name
 *           example: "HDFC Bank"
 *         enabled:
 *           type: integer
 *           description: Bank enabled status (1 = enabled, 0 = disabled)
 *           example: 1
 *     UpdateBankRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Bank ID
 *           example: "HDFC"
 *         name:
 *           type: string
 *           description: Bank name
 *           example: "HDFC Bank"
 *         enabled:
 *           type: integer
 *           description: Bank enabled status (1 = enabled, 0 = disabled)
 *           example: 1
 *     DeleteBankRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Bank ID
 *           example: "HDFC"
 */

// ==================== BANK CONTROLLERS ====================

/**
 * @swagger
 * /api/banks:
 *   get:
 *     summary: Get all banks
 *     tags: [Banks]
 *     responses:
 *       200:
 *         description: Banks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Banks retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bank'
 *       500:
 *         description: Internal server error
 */
export async function getAllBanks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Get all banks request");
    const userService = new UserService();
    const result = await userService.getAllBanks();
    res.json(result);
  } catch (err) {
    console.error("Error in getAllBanks controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/banks/create:
 *   post:
 *     summary: Create a new bank
 *     tags: [Banks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBankRequest'
 *     responses:
 *       201:
 *         description: Bank created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BankResponse'
 *       400:
 *         description: Bad request - bank ID or name already exists
 *       500:
 *         description: Internal server error
 */
export async function createBank(
  req: Request<{}, {}, CreateBankRequest>,
  res: Response<BankResponse>,
  next: NextFunction,
) {
  try {
    console.log("Create bank request body:", req.body);
    const userService = new UserService();
    const result = await userService.createBank(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in createBank controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/banks/update:
 *   put:
 *     summary: Update an existing bank
 *     tags: [Banks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBankRequest'
 *     responses:
 *       200:
 *         description: Bank updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BankResponse'
 *       404:
 *         description: Bank not found
 *       500:
 *         description: Internal server error
 */
export async function updateBank(
  req: Request<{}, {}, UpdateBankRequest>,
  res: Response<BankResponse>,
  next: NextFunction,
) {
  try {
    console.log("Update bank request body:", req.body);
    const userService = new UserService();
    const result = await userService.updateBank(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error in updateBank controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/banks/delete:
 *   delete:
 *     summary: Delete a bank
 *     tags: [Banks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteBankRequest'
 *     responses:
 *       200:
 *         description: Bank deleted successfully
 *       404:
 *         description: Bank not found
 *       500:
 *         description: Internal server error
 */
export async function deleteBank(
  req: Request<{}, {}, DeleteBankRequest>,
  res: Response<BankResponse>,
  next: NextFunction,
) {
  try {
    console.log("Delete bank request body:", req.body);
    const userService = new UserService();
    const result = await userService.deleteBank(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error in deleteBank controller:", err);
    next(err);
  }
}

// ==================== USER PERMISSIONS CONTROLLERS ====================

/**
 * @swagger
 * /api/user-permissions:
 *   get:
 *     summary: Get all user permissions
 *     tags: [User Permissions]
 *     responses:
 *       200:
 *         description: User permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User permissions retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserPermission'
 *       500:
 *         description: Internal server error
 */
export async function getAllUserPermissions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Get all user permissions request");
    const userService = new UserService();
    const result = await userService.getAllUserPermissions();
    res.json(result);
  } catch (err) {
    console.error("Error in getAllUserPermissions controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/user-permissions/create:
 *   post:
 *     summary: Create a new user permission
 *     tags: [User Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserPermissionRequest'
 *     responses:
 *       201:
 *         description: User permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPermissionResponse'
 *       400:
 *         description: Bad request - user or permission not found, or already exists
 *       500:
 *         description: Internal server error
 */
export async function createUserPermission(
  req: Request<{}, {}, CreateUserPermissionRequest>,
  res: Response<UserPermissionResponse>,
  next: NextFunction,
) {
  try {
    console.log("Create user permission request body:", req.body);
    const userService = new UserService();
    const result = await userService.createUserPermission(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in createUserPermission controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/user-permissions/update:
 *   put:
 *     summary: Update an existing user permission
 *     tags: [User Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPermissionRequest'
 *     responses:
 *       200:
 *         description: User permission updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPermissionResponse'
 *       404:
 *         description: User permission not found
 *       500:
 *         description: Internal server error
 */
export async function updateUserPermission(
  req: Request<{}, {}, UpdateUserPermissionRequest>,
  res: Response<UserPermissionResponse>,
  next: NextFunction,
) {
  try {
    console.log("Update user permission request body:", req.body);
    const userService = new UserService();
    const result = await userService.updateUserPermission(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error in updateUserPermission controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/user-permissions/delete:
 *   delete:
 *     summary: Delete a user permission
 *     tags: [User Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteUserPermissionRequest'
 *     responses:
 *       200:
 *         description: User permission deleted successfully
 *       404:
 *         description: User permission not found
 *       500:
 *         description: Internal server error
 */
export async function deleteUserPermission(
  req: Request<{}, {}, DeleteUserPermissionRequest>,
  res: Response<UserPermissionResponse>,
  next: NextFunction,
) {
  try {
    console.log("Delete user permission request body:", req.body);
    const userService = new UserService();
    const result = await userService.deleteUserPermission(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error in deleteUserPermission controller:", err);
    next(err);
  }
}

// ==================== ROLE PERMISSIONS CONTROLLERS ====================

/**
 * @swagger
 * /api/role-permissions:
 *   get:
 *     summary: Get all role permissions
 *     tags: [Role Permissions]
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Role permissions retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RolePermission'
 *       500:
 *         description: Internal server error
 */
export async function getAllRolePermissions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Get all role permissions request");
    const userService = new UserService();
    const result = await userService.getAllRolePermissions();
    res.json(result);
  } catch (err) {
    console.error("Error in getAllRolePermissions controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/role-permissions/create:
 *   post:
 *     summary: Create a new role permission
 *     tags: [Role Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRolePermissionRequest'
 *     responses:
 *       201:
 *         description: Role permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolePermissionResponse'
 *       400:
 *         description: Bad request - role or permission not found, or already exists
 *       500:
 *         description: Internal server error
 */
export async function createRolePermission(
  req: Request<{}, {}, CreateRolePermissionRequest>,
  res: Response<RolePermissionResponse>,
  next: NextFunction,
) {
  try {
    console.log("Create role permission request body:", req.body);
    const userService = new UserService();
    const result = await userService.createRolePermission(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in createRolePermission controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/role-permissions/update:
 *   put:
 *     summary: Update an existing role permission
 *     tags: [Role Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRolePermissionRequest'
 *     responses:
 *       200:
 *         description: Role permission updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolePermissionResponse'
 *       404:
 *         description: Role permission not found
 *       500:
 *         description: Internal server error
 */
export async function updateRolePermission(
  req: Request<{}, {}, UpdateRolePermissionRequest>,
  res: Response<RolePermissionResponse>,
  next: NextFunction,
) {
  try {
    console.log("Update role permission request body:", req.body);
    const userService = new UserService();
    const result = await userService.updateRolePermission(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error in updateRolePermission controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/role-permissions/delete:
 *   delete:
 *     summary: Delete a role permission
 *     tags: [Role Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteRolePermissionRequest'
 *     responses:
 *       200:
 *         description: Role permission deleted successfully
 *       404:
 *         description: Role permission not found
 *       500:
 *         description: Internal server error
 */
export async function deleteRolePermission(
  req: Request<{}, {}, DeleteRolePermissionRequest>,
  res: Response<RolePermissionResponse>,
  next: NextFunction,
) {
  try {
    console.log("Delete role permission request body:", req.body);
    const userService = new UserService();
    const result = await userService.deleteRolePermission(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error in deleteRolePermission controller:", err);
    next(err);
  }
}

// ==================== USER ROLES CONTROLLERS ====================

/**
 * @swagger
 * /api/user-roles:
 *   get:
 *     summary: Get all user roles
 *     tags: [User Roles]
 *     responses:
 *       200:
 *         description: User roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User roles retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserRole'
 *       500:
 *         description: Internal server error
 */
export async function getAllUserRoles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Get all user roles request");
    const userService = new UserService();
    const result = await userService.getAllUserRoles();
    res.json(result);
  } catch (err) {
    console.error("Error in getAllUserRoles controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/user-roles/create:
 *   post:
 *     summary: Create a new user role
 *     tags: [User Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRoleRequest'
 *     responses:
 *       201:
 *         description: User role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRoleResponse'
 *       400:
 *         description: Bad request - user or role not found, or already exists
 *       500:
 *         description: Internal server error
 */
export async function createUserRole(
  req: Request<{}, {}, CreateUserRoleRequest>,
  res: Response<UserRoleResponse>,
  next: NextFunction,
) {
  try {
    console.log("Create user role request body:", req.body);
    const userService = new UserService();
    const result = await userService.createUserRole(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in createUserRole controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/user-roles/delete:
 *   delete:
 *     summary: Delete a user role
 *     tags: [User Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteUserRoleRequest'
 *     responses:
 *       200:
 *         description: User role deleted successfully
 *       404:
 *         description: User role not found
 *       500:
 *         description: Internal server error
 */
export async function deleteUserRole(
  req: Request<{}, {}, DeleteUserRoleRequest>,
  res: Response<UserRoleResponse>,
  next: NextFunction,
) {
  try {
    console.log("Delete user role request body:", req.body);
    const userService = new UserService();
    const result = await userService.deleteUserRole(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error in deleteUserRole controller:", err);
    next(err);
  }
}

// ==================== USER SECURITY FLAGS CONTROLLERS ====================

/**
 * @swagger
 * /api/user-security-flags:
 *   get:
 *     summary: Get all user security flags
 *     tags: [User Security Flags]
 *     responses:
 *       200:
 *         description: User security flags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User security flags retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserSecurityFlag'
 *       500:
 *         description: Internal server error
 */
export async function getAllUserSecurityFlags(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Get all user security flags request");
    const userService = new UserService();
    const result = await userService.getAllUserSecurityFlags();
    res.json(result);
  } catch (err) {
    console.error("Error in getAllUserSecurityFlags controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/user-security-flags/{user_id}:
 *   get:
 *     summary: Get user security flag by user_id
 *     tags: [User Security Flags]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User security flag retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User security flag retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserSecurityFlag'
 *       404:
 *         description: User security flag not found
 *       500:
 *         description: Internal server error
 */
export async function getUserSecurityFlagByUserId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userIdParam = req.params.user_id;

    if (!userIdParam) {
      return res.status(400).json({
        status: false,
        message: "user_id parameter is required",
        statuscode: 400,
      });
    }

    // Handle both string and string[] types
    const userIdStr = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

    if (!userIdStr) {
      return res.status(400).json({
        status: false,
        message: "user_id parameter is required",
        statuscode: 400,
      });
    }

    const userId = parseInt(userIdStr);

    if (isNaN(userId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid user_id parameter",
        statuscode: 400,
      });
    }

    console.log("Get user security flag by user_id request:", userId);
    const userService = new UserService();
    const result = await userService.getUserSecurityFlagByUserId(userId);

    if (!result.status) {
      const statusCode = result.statuscode || 500;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in getUserSecurityFlagByUserId controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/user-security-flags/create:
 *   post:
 *     summary: Create a new user security flag
 *     tags: [User Security Flags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserSecurityFlagRequest'
 *     responses:
 *       201:
 *         description: User security flag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSecurityFlagResponse'
 *       400:
 *         description: Bad request - user not found or security flag already exists
 *       500:
 *         description: Internal server error
 */
export async function createUserSecurityFlag(
  req: Request<{}, {}, CreateUserSecurityFlagRequest>,
  res: Response<UserSecurityFlagResponse>,
  next: NextFunction,
) {
  try {
    console.log("Create user security flag request body:", req.body);
    const userService = new UserService();
    const result = await userService.createUserSecurityFlag(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in createUserSecurityFlag controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/user-security-flags/update:
 *   put:
 *     summary: Update an existing user security flag
 *     tags: [User Security Flags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserSecurityFlagRequest'
 *     responses:
 *       200:
 *         description: User security flag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSecurityFlagResponse'
 *       404:
 *         description: User security flag not found
 *       500:
 *         description: Internal server error
 */
export async function updateUserSecurityFlag(
  req: Request<{}, {}, UpdateUserSecurityFlagRequest>,
  res: Response<UserSecurityFlagResponse>,
  next: NextFunction,
) {
  try {
    console.log("Update user security flag request body:", req.body);
    const userService = new UserService();
    const result = await userService.updateUserSecurityFlag(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error in updateUserSecurityFlag controller:", err);
    next(err);
  }
}

/**
 * @swagger
 * /api/user-security-flags/delete:
 *   delete:
 *     summary: Delete a user security flag
 *     tags: [User Security Flags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteUserSecurityFlagRequest'
 *     responses:
 *       200:
 *         description: User security flag deleted successfully
 *       404:
 *         description: User security flag not found
 *       500:
 *         description: Internal server error
 */
export async function deleteUserSecurityFlag(
  req: Request<{}, {}, DeleteUserSecurityFlagRequest>,
  res: Response<UserSecurityFlagResponse>,
  next: NextFunction,
) {
  try {
    console.log("Delete user security flag request body:", req.body);
    const userService = new UserService();
    const result = await userService.deleteUserSecurityFlag(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error in deleteUserSecurityFlag controller:", err);
    next(err);
  }
}
