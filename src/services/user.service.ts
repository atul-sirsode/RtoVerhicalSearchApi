import mysql from "mysql2/promise";
import { env } from "../config/env.js";
import type {
  UserApiResponse,
  LoginRequest,
  LoginResponse,
  GetUserInfoRequest,
  GetUserInfoResponse,
  GetUserPermissionsRequest,
  GetUserPermissionsResponse,
  PermissionWithStatus,
  User,
  UserSecurityFlag,
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
  CreateUserResponse,
  UpdateUserResponse,
  DeleteUserResponse,
  CreatePermissionResponse,
  UpdatePermissionResponse,
  DeletePermissionResponse,
  CreateRoleResponse,
  UpdateRoleResponse,
  DeleteRoleResponse,
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
import { JwtService } from "./jwt.service.js";

const dbConfig = {
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
};

async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error("Database connection failed:", error);
    return null;
  }
}

const USERS_TABLE = "users";
const PERMISSIONS_TABLE = "permissions";
const ROLES_TABLE = "roles";
const USER_PERMISSIONS_TABLE = "user_permissions";
const ROLE_PERMISSIONS_TABLE = "role_permissions";
const USER_ROLES_TABLE = "user_roles";
const USER_SECURITY_FLAGS_TABLE = "user_security_flags";
const BANKS_TABLE = "banks";

export class UserService {
  /**
   * User login authentication
   */
  async login(request: LoginRequest): Promise<UserApiResponse> {
    try {
      // Validate input
      if (!request.email || !request.password) {
        return {
          status: false,
          message: "Email and password are required",
          statuscode: 400,
        };
      }

      const connection = await getConnection();

      if (!connection) {
        return {
          status: false,
          message: "Database connection failed",
          statuscode: 500,
        };
      }

      try {
        // Get user with password hash
        const userQuery = `
          SELECT 
            user_id,
            username,
            display_name,
            email,
            password_hash,
            is_active,
            jwt_secret,
            partner_id,
            created_at,
            updated_at
          FROM ${USERS_TABLE}
          WHERE email = ? AND is_active = 1 AND deleted_at IS NULL
          LIMIT 1
        `;

        const [userRows] = await connection.execute(userQuery, [request.email]);

        if (!Array.isArray(userRows) || userRows.length === 0) {
          await connection.end();
          return {
            status: false,
            message: "Invalid email or password",
            statuscode: 401,
          };
        }

        const user = userRows[0] as any;
        const userId = user.user_id;

        // Verify password (simple comparison for now - use bcrypt in production)
        if (user.password_hash !== request.password) {
          await connection.end();
          return {
            status: false,
            message: "Invalid email or password",
            statuscode: 401,
          };
        }

        // Get user security flags
        const securityQuery = `
          SELECT 
            COALESCE(is_admin, 0) AS is_admin,
            COALESCE(bypass_otp, 0) AS bypass_otp,
            COALESCE(mfa_enrolled, 0) AS mfa_enrolled,
            updated_at
          FROM ${USER_SECURITY_FLAGS_TABLE}
          WHERE user_id = ?
          LIMIT 1
        `;

        const [securityRows] = await connection.execute(securityQuery, [
          userId,
        ]);

        const securityData = securityRows as any[];
        const securityFlags: UserSecurityFlag =
          securityData.length > 0
            ? {
                user_id: userId,
                is_admin: securityData[0].is_admin || 0,
                bypass_otp: securityData[0].bypass_otp || 0,
                mfa_enrolled: securityData[0].mfa_enrolled || 0,
                updated_at: securityData[0].updated_at,
              }
            : {
                user_id: userId,
                is_admin: 0,
                bypass_otp: 0,
                mfa_enrolled: 0,
                updated_at: new Date(),
              };

        // Update last login timestamp
        const updateQuery = `
          UPDATE ${USERS_TABLE}
          SET updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `;

        await connection.execute(updateQuery, [userId]);
        await connection.end();

        const loginResponse: LoginResponse = {
          user_id: user.user_id,
          username: user.username,
          display_name: user.display_name,
          email: user.email,
          is_active: user.is_active,
          is_admin: securityFlags.is_admin,
          bypass_otp: securityFlags.bypass_otp,
          jwt_secret: user.jwt_secret,
          partner_id: user.partner_id,
          last_login: new Date(),
        };

        // Generate JWT token using user's jwt_secret and partner_id
        const jwtService = new JwtService();
        const tokenResponse = jwtService.generateToken(
          user.jwt_secret,
          user.partner_id,
          user.user_id,
          user.email,
        );

        // Add token to response
        loginResponse.token = tokenResponse.token;

        return {
          status: true,
          message: "Login successful",
          data: loginResponse,
        };
      } catch (error) {
        await connection.end();
        throw error;
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        status: false,
        message: "Internal server error",
        statuscode: 500,
      };
    }
  }

  /**
   * Get user information by email
   */
  async getUserInfo(request: GetUserInfoRequest): Promise<UserApiResponse> {
    try {
      if (!request.email) {
        return {
          status: false,
          message: "Email is required",
          statuscode: 400,
        };
      }

      const connection = await getConnection();

      if (!connection) {
        return {
          status: false,
          message: "Database connection failed",
          statuscode: 500,
        };
      }

      try {
        // Get user basic info
        const userQuery = `
          SELECT 
            user_id,
            username,
            display_name,
            email,
            is_active,
            jwt_secret,
            partner_id,
            created_at,
            updated_at
          FROM ${USERS_TABLE}
          WHERE email = ? AND is_active = 1 AND deleted_at IS NULL
          LIMIT 1
        `;

        const [userRows] = await connection.execute(userQuery, [request.email]);

        if (!Array.isArray(userRows) || userRows.length === 0) {
          await connection.end();
          return {
            status: false,
            message: "User not found",
            statuscode: 404,
          };
        }

        const user = userRows[0] as any;
        const userId = user.user_id;

        // Get user security flags
        const securityQuery = `
          SELECT 
            COALESCE(is_admin, 0) AS is_admin,
            COALESCE(bypass_otp, 0) AS bypass_otp,
            COALESCE(mfa_enrolled, 0) AS mfa_enrolled,
            updated_at
          FROM ${USER_SECURITY_FLAGS_TABLE}
          WHERE user_id = ?
          LIMIT 1
        `;

        const [securityRows] = await connection.execute(securityQuery, [
          userId,
        ]);

        const securityData = securityRows as any[];
        const securityFlags: UserSecurityFlag =
          securityData.length > 0
            ? {
                user_id: userId,
                is_admin: securityData[0].is_admin || 0,
                bypass_otp: securityData[0].bypass_otp || 0,
                mfa_enrolled: securityData[0].mfa_enrolled || 0,
                updated_at: securityData[0].updated_at,
              }
            : {
                user_id: userId,
                is_admin: 0,
                bypass_otp: 0,
                mfa_enrolled: 0,
                updated_at: new Date(),
              };

        await connection.end();

        const userInfo: GetUserInfoResponse = {
          user_id: user.user_id,
          username: user.username,
          display_name: user.display_name,
          email: user.email,
          is_active: user.is_active,
          is_admin: securityFlags.is_admin,
          bypass_otp: securityFlags.bypass_otp,
          jwt_secret: user.jwt_secret,
          partner_id: user.partner_id,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };

        return {
          status: true,
          message: "User information retrieved successfully",
          data: userInfo,
        };
      } catch (error) {
        await connection.end();
        throw error;
      }
    } catch (error) {
      console.error("Get user info error:", error);
      return {
        status: false,
        message: "Internal server error",
        statuscode: 500,
      };
    }
  }

  /**
   * Get user permissions by email
   */
  async getUserPermissions(
    request: GetUserPermissionsRequest,
  ): Promise<UserApiResponse> {
    try {
      if (!request.email) {
        return {
          status: false,
          message: "Email is required",
          statuscode: 400,
        };
      }

      const connection = await getConnection();

      if (!connection) {
        return {
          status: false,
          message: "Database connection failed",
          statuscode: 500,
        };
      }

      try {
        // Get user ID first
        const userQuery = `
          SELECT user_id
          FROM ${USERS_TABLE}
          WHERE email = ? AND is_active = 1 AND deleted_at IS NULL
          LIMIT 1
        `;

        const [userRows] = await connection.execute(userQuery, [request.email]);

        if (!Array.isArray(userRows) || userRows.length === 0) {
          await connection.end();
          return {
            status: false,
            message: "User not found",
            statuscode: 404,
          };
        }

        const user = userRows[0] as any;
        const userId = user.user_id;

        // Get user permissions
        const permissionsQuery = `
          SELECT 
            p.permission_id,
            p.perm_key,
            p.perm_name,
            p.category,
            p.description,
            COALESCE(uo.is_allowed, 0) AS is_allowed,
            COALESCE(role_allowed, 0) AS role_allowed
          FROM ${PERMISSIONS_TABLE} p
          LEFT JOIN (
            SELECT 
              up.permission_id,
              up.is_allowed
            FROM ${USER_PERMISSIONS_TABLE} up
            WHERE up.user_id = ?
          ) uo ON p.permission_id = uo.permission_id
          LEFT JOIN (
            SELECT 
              rp.permission_id,
              CASE WHEN SUM(rp.is_allowed) > 0 THEN 1 ELSE 0 END AS role_allowed
            FROM ${ROLE_PERMISSIONS_TABLE} rp
            JOIN ${USER_ROLES_TABLE} ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = ?
            GROUP BY rp.permission_id
          ) ra ON p.permission_id = ra.permission_id
          ORDER BY p.category, p.perm_name
        `;

        const [permissionRows] = await connection.execute(permissionsQuery, [
          userId,
          userId,
        ]);

        await connection.end();

        const permissions = permissionRows as any[];
        const permissionsWithStatus: PermissionWithStatus[] = permissions.map(
          (permission) => ({
            permission_id: permission.permission_id,
            perm_key: permission.perm_key,
            perm_name: permission.perm_name,
            category: permission.category,
            description: permission.description,
            is_allowed: permission.is_allowed,
            role_allowed: permission.role_allowed,
          }),
        );

        return {
          status: true,
          message: "User permissions retrieved successfully",
          data: permissionsWithStatus,
        };
      } catch (error) {
        await connection.end();
        throw error;
      }
    } catch (error) {
      console.error("Get user permissions error:", error);
      return {
        status: false,
        message: "Internal server error",
        statuscode: 500,
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<User | null> {
    try {
      const connection = await getConnection();

      if (!connection) {
        return null;
      }

      try {
        const query = `
          SELECT 
            user_id,
            username,
            display_name,
            email,
            password_hash,
            is_active,
            jwt_secret,
            partner_id,
            created_at,
            updated_at,
            deleted_at
          FROM ${USERS_TABLE}
          WHERE user_id = ? AND is_active = 1 AND deleted_at IS NULL
          LIMIT 1
        `;

        const [rows] = await connection.execute(query, [userId]);
        await connection.end();

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        return rows[0] as User;
      } catch (error) {
        await connection.end();
        throw error;
      }
    } catch (error) {
      console.error("Get user by ID error:", error);
      return null;
    }
  }

  /**
   * Get all active users
   */
  async getAllActiveUsers(): Promise<User[]> {
    try {
      const connection = await getConnection();

      if (!connection) {
        return [];
      }

      try {
        const query = `
          SELECT 
            user_id,
            username,
            display_name,
            email,
            is_active,
            jwt_secret,
            partner_id,
            created_at,
            updated_at
          FROM ${USERS_TABLE}
          WHERE is_active = 1 AND deleted_at IS NULL
          ORDER BY created_at DESC
        `;

        const [rows] = await connection.execute(query);
        await connection.end();

        return rows as User[];
      } catch (error) {
        await connection.end();
        throw error;
      }
    } catch (error) {
      console.error("Get all active users error:", error);
      return [];
    }
  }

  // ==================== USER CRUD OPERATIONS ====================

  /**
   * Create a new user
   */
  async createUser(request: CreateUserRequest): Promise<UserApiResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if username or email already exists
      const [existingUsers] = await connection.execute(
        `SELECT user_id FROM ${USERS_TABLE} WHERE username = ? OR email = ?`,
        [request.username, request.email],
      );

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        await connection.end();
        return {
          status: false,
          message: "Username or email already exists",
          statuscode: 400,
        };
      }

      // Hash password (simple hash for now, use bcrypt in production)
      const passwordHash = request.password; // TODO: Implement bcrypt

      // Insert new user
      const [result] = await connection.execute(
        `INSERT INTO ${USERS_TABLE} (username, display_name, email, password_hash, is_active, jwt_secret, partner_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          request.username,
          request.display_name,
          request.email,
          passwordHash,
          request.is_active || 1,
          request.jwt_secret || null,
          request.partner_id || null,
        ],
      );

      await connection.end();

      return {
        status: true,
        message: "User created successfully",
        data: {
          user_id: (result as any).insertId,
          username: request.username,
          display_name: request.display_name,
          email: request.email,
          is_active: request.is_active || 1,
          jwt_secret: request.jwt_secret,
          partner_id: request.partner_id,
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Create user error:", error);
      return {
        status: false,
        message: "Failed to create user",
        statuscode: 500,
      };
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(request: UpdateUserRequest): Promise<UserApiResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if user exists
      const [existingUsers] = await connection.execute(
        `SELECT user_id FROM ${USERS_TABLE} WHERE user_id = ?`,
        [request.user_id],
      );

      if (!Array.isArray(existingUsers) || existingUsers.length === 0) {
        await connection.end();
        return {
          status: false,
          message: "User not found",
          statuscode: 404,
        };
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];

      if (request.username !== undefined) {
        updateFields.push("username = ?");
        updateValues.push(request.username);
      }
      if (request.display_name !== undefined) {
        updateFields.push("display_name = ?");
        updateValues.push(request.display_name);
      }
      if (request.email !== undefined) {
        updateFields.push("email = ?");
        updateValues.push(request.email);
      }
      if (request.password !== undefined) {
        updateFields.push("password_hash = ?");
        updateValues.push(request.password); // TODO: Implement bcrypt
      }
      if (request.is_active !== undefined) {
        updateFields.push("is_active = ?");
        updateValues.push(request.is_active);
      }
      if (request.jwt_secret !== undefined) {
        updateFields.push("jwt_secret = ?");
        updateValues.push(request.jwt_secret);
      }
      if (request.partner_id !== undefined) {
        updateFields.push("partner_id = ?");
        updateValues.push(request.partner_id);
      }

      if (updateFields.length === 0) {
        await connection.end();
        return {
          status: false,
          message: "No fields to update",
          statuscode: 400,
        };
      }

      updateFields.push("updated_at = NOW()");
      updateValues.push(request.user_id);

      const [result] = await connection.execute(
        `UPDATE ${USERS_TABLE} SET ${updateFields.join(", ")} WHERE user_id = ?`,
        updateValues,
      );

      await connection.end();

      return {
        status: true,
        message: "User updated successfully",
        data: { affectedRows: (result as any).affectedRows },
      };
    } catch (error) {
      await connection.end();
      console.error("Update user error:", error);
      return {
        status: false,
        message: "Failed to update user",
        statuscode: 500,
      };
    }
  }

  /**
   * Soft delete a user (set deleted_at)
   */
  async deleteUser(request: DeleteUserRequest): Promise<UserApiResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if user exists
      const [existingUsers] = await connection.execute(
        `SELECT user_id FROM ${USERS_TABLE} WHERE user_id = ? AND deleted_at IS NULL`,
        [request.user_id],
      );

      if (!Array.isArray(existingUsers) || existingUsers.length === 0) {
        await connection.end();
        return {
          status: false,
          message: "User not found",
          statuscode: 404,
        };
      }

      // Soft delete user
      const [result] = await connection.execute(
        `UPDATE ${USERS_TABLE} SET deleted_at = NOW(), updated_at = NOW() WHERE user_id = ?`,
        [request.user_id],
      );

      await connection.end();

      return {
        status: true,
        message: "User deleted successfully",
        data: { affectedRows: (result as any).affectedRows },
      };
    } catch (error) {
      await connection.end();
      console.error("Delete user error:", error);
      return {
        status: false,
        message: "Failed to delete user",
        statuscode: 500,
      };
    }
  }

  // ==================== PERMISSION CRUD OPERATIONS ====================

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    const connection = await getConnection();
    if (!connection) {
      return [];
    }
    console.log("Get all permissions request");
    try {
      const [rows] = await connection.execute(
        `SELECT permission_id, perm_key, perm_name, category, description 
         FROM ${PERMISSIONS_TABLE} 
         ORDER BY category, perm_name`,
      );

      await connection.end();
      return rows as Permission[];
    } catch (error) {
      await connection.end();
      console.error("Get all permissions error:", error);
      return [];
    }
  }

  /**
   * Create a new permission
   */
  async createPermission(
    request: CreatePermissionRequest,
  ): Promise<UserApiResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if permission key already exists
      const [existingPermissions] = await connection.execute(
        `SELECT permission_id FROM ${PERMISSIONS_TABLE} WHERE perm_key = ?`,
        [request.perm_key],
      );

      if (
        Array.isArray(existingPermissions) &&
        existingPermissions.length > 0
      ) {
        await connection.end();
        return {
          status: false,
          message: "Permission key already exists",
          statuscode: 400,
        };
      }

      // Insert new permission
      const [result] = await connection.execute(
        `INSERT INTO ${PERMISSIONS_TABLE} (perm_key, perm_name, category, description) 
         VALUES (?, ?, ?, ?)`,
        [
          request.perm_key,
          request.perm_name,
          request.category || null,
          request.description || null,
        ],
      );

      await connection.end();

      return {
        status: true,
        message: "Permission created successfully",
        data: {
          permission_id: (result as any).insertId,
          perm_key: request.perm_key,
          perm_name: request.perm_name,
          category: request.category,
          description: request.description,
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Create permission error:", error);
      return {
        status: false,
        message: "Failed to create permission",
        statuscode: 500,
      };
    }
  }

  /**
   * Update an existing permission
   */
  async updatePermission(
    request: UpdatePermissionRequest,
  ): Promise<UserApiResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if permission exists
      const [existingPermissions] = await connection.execute(
        `SELECT permission_id FROM ${PERMISSIONS_TABLE} WHERE permission_id = ?`,
        [request.permission_id],
      );

      if (
        !Array.isArray(existingPermissions) ||
        existingPermissions.length === 0
      ) {
        await connection.end();
        return {
          status: false,
          message: "Permission not found",
          statuscode: 404,
        };
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];

      if (request.perm_key !== undefined) {
        updateFields.push("perm_key = ?");
        updateValues.push(request.perm_key);
      }
      if (request.perm_name !== undefined) {
        updateFields.push("perm_name = ?");
        updateValues.push(request.perm_name);
      }
      if (request.category !== undefined) {
        updateFields.push("category = ?");
        updateValues.push(request.category);
      }
      if (request.description !== undefined) {
        updateFields.push("description = ?");
        updateValues.push(request.description);
      }

      if (updateFields.length === 0) {
        await connection.end();
        return {
          status: false,
          message: "No fields to update",
          statuscode: 400,
        };
      }

      updateValues.push(request.permission_id);

      const [result] = await connection.execute(
        `UPDATE ${PERMISSIONS_TABLE} SET ${updateFields.join(", ")} WHERE permission_id = ?`,
        updateValues,
      );

      await connection.end();

      return {
        status: true,
        message: "Permission updated successfully",
        data: { affectedRows: (result as any).affectedRows },
      };
    } catch (error) {
      await connection.end();
      console.error("Update permission error:", error);
      return {
        status: false,
        message: "Failed to update permission",
        statuscode: 500,
      };
    }
  }

  /**
   * Delete a permission
   */
  async deletePermission(
    request: DeletePermissionRequest,
  ): Promise<UserApiResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if permission exists
      const [existingPermissions] = await connection.execute(
        `SELECT permission_id FROM ${PERMISSIONS_TABLE} WHERE permission_id = ?`,
        [request.permission_id],
      );

      if (
        !Array.isArray(existingPermissions) ||
        existingPermissions.length === 0
      ) {
        await connection.end();
        return {
          status: false,
          message: "Permission not found",
          statuscode: 404,
        };
      }

      // Check if permission is being used by roles or users
      const [roleUsageCheck] = await connection.execute(
        `SELECT COUNT(*) as count FROM ${ROLE_PERMISSIONS_TABLE} WHERE permission_id = ?`,
        [request.permission_id],
      );

      const [userUsageCheck] = await connection.execute(
        `SELECT COUNT(*) as count FROM ${USER_PERMISSIONS_TABLE} WHERE permission_id = ?`,
        [request.permission_id],
      );

      const roleUsageCount = (roleUsageCheck as any[])[0].count;
      const userUsageCount = (userUsageCheck as any[])[0].count;
      const totalUsageCount = roleUsageCount + userUsageCount;

      if (totalUsageCount > 0) {
        await connection.end();
        return {
          status: false,
          message:
            "Cannot delete permission: it is being used by roles or users",
          statuscode: 400,
        };
      }

      // Delete permission
      const [result] = await connection.execute(
        `DELETE FROM ${PERMISSIONS_TABLE} WHERE permission_id = ?`,
        [request.permission_id],
      );

      await connection.end();

      return {
        status: true,
        message: "Permission deleted successfully",
        data: { affectedRows: (result as any).affectedRows },
      };
    } catch (error) {
      await connection.end();
      console.error("Delete permission error:", error);
      return {
        status: false,
        message: "Failed to delete permission",
        statuscode: 500,
      };
    }
  }

  // ==================== ROLE CRUD OPERATIONS ====================

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<Role[]> {
    const connection = await getConnection();
    if (!connection) {
      return [];
    }

    try {
      const [rows] = await connection.execute(
        `SELECT role_id, role_key, role_name, is_system_role, created_at, updated_at 
         FROM ${ROLES_TABLE} 
         ORDER BY role_name`,
      );

      await connection.end();
      return rows as Role[];
    } catch (error) {
      await connection.end();
      console.error("Get all roles error:", error);
      return [];
    }
  }

  /**
   * Create a new role
   */
  async createRole(request: CreateRoleRequest): Promise<UserApiResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if role key already exists
      const [existingRoles] = await connection.execute(
        `SELECT role_id FROM ${ROLES_TABLE} WHERE role_key = ?`,
        [request.role_key],
      );

      if (Array.isArray(existingRoles) && existingRoles.length > 0) {
        await connection.end();
        return {
          status: false,
          message: "Role key already exists",
          statuscode: 400,
        };
      }

      // Insert new role
      const [result] = await connection.execute(
        `INSERT INTO ${ROLES_TABLE} (role_key, role_name, is_system_role, created_at, updated_at) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        [request.role_key, request.role_name, request.is_system_role || 0],
      );

      await connection.end();

      return {
        status: true,
        message: "Role created successfully",
        data: {
          role_id: (result as any).insertId,
          role_key: request.role_key,
          role_name: request.role_name,
          is_system_role: request.is_system_role || 0,
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Create role error:", error);
      return {
        status: false,
        message: "Failed to create role",
        statuscode: 500,
      };
    }
  }

  /**
   * Update an existing role
   */
  async updateRole(request: UpdateRoleRequest): Promise<UserApiResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if role exists
      const [existingRoles] = await connection.execute(
        `SELECT role_id, is_system_role FROM ${ROLES_TABLE} WHERE role_id = ?`,
        [request.role_id],
      );

      if (!Array.isArray(existingRoles) || existingRoles.length === 0) {
        await connection.end();
        return {
          status: false,
          message: "Role not found",
          statuscode: 404,
        };
      }

      const role = existingRoles as any[];

      // Prevent modification of system roles
      if (role[0].is_system_role === 1) {
        await connection.end();
        return {
          status: false,
          message: "Cannot modify system roles",
          statuscode: 400,
        };
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];

      if (request.role_key !== undefined) {
        updateFields.push("role_key = ?");
        updateValues.push(request.role_key);
      }
      if (request.role_name !== undefined) {
        updateFields.push("role_name = ?");
        updateValues.push(request.role_name);
      }
      if (request.is_system_role !== undefined) {
        updateFields.push("is_system_role = ?");
        updateValues.push(request.is_system_role);
      }

      if (updateFields.length === 0) {
        await connection.end();
        return {
          status: false,
          message: "No fields to update",
          statuscode: 400,
        };
      }

      updateFields.push("updated_at = NOW()");
      updateValues.push(request.role_id);

      const [result] = await connection.execute(
        `UPDATE ${ROLES_TABLE} SET ${updateFields.join(", ")} WHERE role_id = ?`,
        updateValues,
      );

      await connection.end();

      return {
        status: true,
        message: "Role updated successfully",
        data: { affectedRows: (result as any).affectedRows },
      };
    } catch (error) {
      await connection.end();
      console.error("Update role error:", error);
      return {
        status: false,
        message: "Failed to update role",
        statuscode: 500,
      };
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(request: DeleteRoleRequest): Promise<UserApiResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if role exists
      const [existingRoles] = await connection.execute(
        `SELECT role_id, is_system_role FROM ${ROLES_TABLE} WHERE role_id = ?`,
        [request.role_id],
      );

      if (!Array.isArray(existingRoles) || existingRoles.length === 0) {
        await connection.end();
        return {
          status: false,
          message: "Role not found",
          statuscode: 404,
        };
      }

      const role = existingRoles as any[];

      // Prevent deletion of system roles
      if (role[0].is_system_role === 1) {
        await connection.end();
        return {
          status: false,
          message: "Cannot delete system roles",
          statuscode: 400,
        };
      }

      // Check if role is being used by users
      const [usageCheck] = await connection.execute(
        `SELECT COUNT(*) as count FROM ${USER_ROLES_TABLE} WHERE role_id = ?`,
        [request.role_id],
      );

      const usageCount = (usageCheck as any[])[0].count;
      if (usageCount > 0) {
        await connection.end();
        return {
          status: false,
          message: "Cannot delete role: it is being used by users",
          statuscode: 400,
        };
      }

      // Delete role permissions first
      await connection.execute(
        `DELETE FROM ${ROLE_PERMISSIONS_TABLE} WHERE role_id = ?`,
        [request.role_id],
      );

      // Delete role
      const [result] = await connection.execute(
        `DELETE FROM ${ROLES_TABLE} WHERE role_id = ?`,
        [request.role_id],
      );

      await connection.end();

      return {
        status: true,
        message: "Role deleted successfully",
        data: { affectedRows: (result as any).affectedRows },
      };
    } catch (error) {
      await connection.end();
      console.error("Delete role error:", error);
      return {
        status: false,
        message: "Failed to delete role",
        statuscode: 500,
      };
    }
  }

  // ==================== BANK CRUD OPERATIONS ====================

  /**
   * Get all banks
   */
  async getAllBanks(): Promise<BanksResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      const [rows] = await connection.execute(
        `SELECT * FROM ${BANKS_TABLE} ORDER BY name`,
      );
      await connection.end();

      return {
        status: true,
        message: "Banks retrieved successfully",
        data: rows as any[],
      };
    } catch (error) {
      await connection.end();
      console.error("Get all banks error:", error);
      return {
        status: false,
        message: "Failed to retrieve banks",
        statuscode: 500,
      };
    }
  }

  /**
   * Create a new bank
   */
  async createBank(request: CreateBankRequest): Promise<BankResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if bank ID already exists
      const [existingBank] = await connection.execute(
        `SELECT id FROM ${BANKS_TABLE} WHERE id = ?`,
        [request.id],
      );

      if ((existingBank as any[]).length > 0) {
        await connection.end();
        return {
          status: false,
          message: "Bank ID already exists",
          statuscode: 400,
        };
      }

      // Check if bank name already exists
      const [existingName] = await connection.execute(
        `SELECT name FROM ${BANKS_TABLE} WHERE name = ?`,
        [request.name],
      );

      if ((existingName as any[]).length > 0) {
        await connection.end();
        return {
          status: false,
          message: "Bank name already exists",
          statuscode: 400,
        };
      }

      // Create bank
      const [result] = await connection.execute(
        `INSERT INTO ${BANKS_TABLE} (id, name, enabled) VALUES (?, ?, ?)`,
        [request.id, request.name, request.enabled ?? 1],
      );

      await connection.end();

      return {
        status: true,
        message: "Bank created successfully",
        data: {
          id: request.id,
          name: request.name,
          enabled: request.enabled ?? 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Create bank error:", error);
      return {
        status: false,
        message: "Failed to create bank",
        statuscode: 500,
      };
    }
  }

  /**
   * Update an existing bank
   */
  async updateBank(request: UpdateBankRequest): Promise<BankResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if bank exists
      const [existingBank] = await connection.execute(
        `SELECT * FROM ${BANKS_TABLE} WHERE id = ?`,
        [request.id],
      );

      if ((existingBank as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "Bank not found",
          statuscode: 404,
        };
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];

      if (request.name !== undefined) {
        updateFields.push("name = ?");
        updateValues.push(request.name);
      }

      if (request.enabled !== undefined) {
        updateFields.push("enabled = ?");
        updateValues.push(request.enabled);
      }

      if (updateFields.length === 0) {
        await connection.end();
        return {
          status: false,
          message: "No fields to update",
          statuscode: 400,
        };
      }

      updateFields.push("updated_at = CURRENT_TIMESTAMP");
      updateValues.push(request.id);

      const [result] = await connection.execute(
        `UPDATE ${BANKS_TABLE} SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues,
      );

      await connection.end();

      return {
        status: true,
        message: "Bank updated successfully",
        data: {
          id: request.id,
          name: request.name ?? "",
          enabled: request.enabled ?? 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Update bank error:", error);
      return {
        status: false,
        message: "Failed to update bank",
        statuscode: 500,
      };
    }
  }

  /**
   * Delete a bank
   */
  async deleteBank(request: DeleteBankRequest): Promise<BankResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if bank exists
      const [existingBank] = await connection.execute(
        `SELECT * FROM ${BANKS_TABLE} WHERE id = ?`,
        [request.id],
      );

      if ((existingBank as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "Bank not found",
          statuscode: 404,
        };
      }

      // Delete bank
      const [result] = await connection.execute(
        `DELETE FROM ${BANKS_TABLE} WHERE id = ?`,
        [request.id],
      );

      await connection.end();

      return {
        status: true,
        message: "Bank deleted successfully",
        data: { id: request.id, affectedRows: (result as any).affectedRows },
      };
    } catch (error) {
      await connection.end();
      console.error("Delete bank error:", error);
      return {
        status: false,
        message: "Failed to delete bank",
        statuscode: 500,
      };
    }
  }

  // ==================== USER PERMISSIONS CRUD OPERATIONS ====================

  /**
   * Get all user permissions
   */
  async getAllUserPermissions(): Promise<UserPermissionsResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      const [rows] = await connection.execute(
        `SELECT up.*, u.email as user_email, p.perm_name as permission_name 
         FROM ${USER_PERMISSIONS_TABLE} up
         LEFT JOIN ${USERS_TABLE} u ON up.user_id = u.user_id
         LEFT JOIN ${PERMISSIONS_TABLE} p ON up.permission_id = p.permission_id
         ORDER BY up.user_id, up.permission_id`,
      );
      await connection.end();

      return {
        status: true,
        message: "User permissions retrieved successfully",
        data: rows as any[],
      };
    } catch (error) {
      await connection.end();
      console.error("Get all user permissions error:", error);
      return {
        status: false,
        message: "Failed to retrieve user permissions",
        statuscode: 500,
      };
    }
  }

  /**
   * Create a new user permission
   */
  async createUserPermission(
    request: CreateUserPermissionRequest,
  ): Promise<UserPermissionResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if user exists
      const [userCheck] = await connection.execute(
        `SELECT user_id FROM ${USERS_TABLE} WHERE user_id = ?`,
        [request.user_id],
      );

      if ((userCheck as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "User not found",
          statuscode: 404,
        };
      }

      // Check if permission exists
      const [permissionCheck] = await connection.execute(
        `SELECT permission_id FROM ${PERMISSIONS_TABLE} WHERE permission_id = ?`,
        [request.permission_id],
      );

      if ((permissionCheck as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "Permission not found",
          statuscode: 404,
        };
      }

      // Check if user permission already exists
      const [existing] = await connection.execute(
        `SELECT * FROM ${USER_PERMISSIONS_TABLE} WHERE user_id = ? AND permission_id = ?`,
        [request.user_id, request.permission_id],
      );

      if ((existing as any[]).length > 0) {
        await connection.end();
        return {
          status: false,
          message: "User permission already exists",
          statuscode: 400,
        };
      }

      // Create user permission
      const [result] = await connection.execute(
        `INSERT INTO ${USER_PERMISSIONS_TABLE} (user_id, permission_id, is_allowed, note, updated_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          request.user_id,
          request.permission_id,
          request.is_allowed,
          request.note ?? null,
        ],
      );

      await connection.end();

      return {
        status: true,
        message: "User permission created successfully",
        data: {
          user_id: request.user_id,
          permission_id: request.permission_id,
          is_allowed: request.is_allowed,
          note: request.note ?? null,
          updated_at: new Date(),
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Create user permission error:", error);
      return {
        status: false,
        message: "Failed to create user permission",
        statuscode: 500,
      };
    }
  }

  /**
   * Update an existing user permission
   */
  async updateUserPermission(
    request: UpdateUserPermissionRequest,
  ): Promise<UserPermissionResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if user permission exists
      const [existing] = await connection.execute(
        `SELECT * FROM ${USER_PERMISSIONS_TABLE} WHERE user_id = ? AND permission_id = ?`,
        [request.user_id, request.permission_id],
      );

      if ((existing as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "User permission not found",
          statuscode: 404,
        };
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];

      if (request.is_allowed !== undefined) {
        updateFields.push("is_allowed = ?");
        updateValues.push(request.is_allowed);
      }

      if (request.note !== undefined) {
        updateFields.push("note = ?");
        updateValues.push(request.note);
      }

      if (updateFields.length === 0) {
        await connection.end();
        return {
          status: false,
          message: "No fields to update",
          statuscode: 400,
        };
      }

      updateFields.push("updated_at = CURRENT_TIMESTAMP");
      updateValues.push(request.user_id, request.permission_id);

      const [result] = await connection.execute(
        `UPDATE ${USER_PERMISSIONS_TABLE} SET ${updateFields.join(", ")} 
         WHERE user_id = ? AND permission_id = ?`,
        updateValues,
      );

      await connection.end();

      return {
        status: true,
        message: "User permission updated successfully",
        data: {
          user_id: request.user_id,
          permission_id: request.permission_id,
          is_allowed: request.is_allowed ?? 1,
          note: request.note ?? null,
          updated_at: new Date(),
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Update user permission error:", error);
      return {
        status: false,
        message: "Failed to update user permission",
        statuscode: 500,
      };
    }
  }

  /**
   * Delete a user permission
   */
  async deleteUserPermission(
    request: DeleteUserPermissionRequest,
  ): Promise<UserPermissionResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if user permission exists
      const [existing] = await connection.execute(
        `SELECT * FROM ${USER_PERMISSIONS_TABLE} WHERE user_id = ? AND permission_id = ?`,
        [request.user_id, request.permission_id],
      );

      if ((existing as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "User permission not found",
          statuscode: 404,
        };
      }

      // Delete user permission
      const [result] = await connection.execute(
        `DELETE FROM ${USER_PERMISSIONS_TABLE} WHERE user_id = ? AND permission_id = ?`,
        [request.user_id, request.permission_id],
      );

      await connection.end();

      return {
        status: true,
        message: "User permission deleted successfully",
        data: {
          user_id: request.user_id,
          permission_id: request.permission_id,
          affectedRows: (result as any).affectedRows,
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Delete user permission error:", error);
      return {
        status: false,
        message: "Failed to delete user permission",
        statuscode: 500,
      };
    }
  }

  // ==================== ROLE PERMISSIONS CRUD OPERATIONS ====================

  /**
   * Get all role permissions
   */
  async getAllRolePermissions(): Promise<RolePermissionsResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      const [rows] = await connection.execute(
        `SELECT rp.*, r.role_name, p.perm_name as permission_name 
         FROM ${ROLE_PERMISSIONS_TABLE} rp
         LEFT JOIN ${ROLES_TABLE} r ON rp.role_id = r.role_id
         LEFT JOIN ${PERMISSIONS_TABLE} p ON rp.permission_id = p.permission_id
         ORDER BY rp.role_id, rp.permission_id`,
      );
      await connection.end();

      return {
        status: true,
        message: "Role permissions retrieved successfully",
        data: rows as any[],
      };
    } catch (error) {
      await connection.end();
      console.error("Get all role permissions error:", error);
      return {
        status: false,
        message: "Failed to retrieve role permissions",
        statuscode: 500,
      };
    }
  }

  /**
   * Create a new role permission
   */
  async createRolePermission(
    request: CreateRolePermissionRequest,
  ): Promise<RolePermissionResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if role exists
      const [roleCheck] = await connection.execute(
        `SELECT role_id FROM ${ROLES_TABLE} WHERE role_id = ?`,
        [request.role_id],
      );

      if ((roleCheck as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "Role not found",
          statuscode: 404,
        };
      }

      // Check if permission exists
      const [permissionCheck] = await connection.execute(
        `SELECT permission_id FROM ${PERMISSIONS_TABLE} WHERE permission_id = ?`,
        [request.permission_id],
      );

      if ((permissionCheck as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "Permission not found",
          statuscode: 404,
        };
      }

      // Check if role permission already exists
      const [existing] = await connection.execute(
        `SELECT * FROM ${ROLE_PERMISSIONS_TABLE} WHERE role_id = ? AND permission_id = ?`,
        [request.role_id, request.permission_id],
      );

      if ((existing as any[]).length > 0) {
        await connection.end();
        return {
          status: false,
          message: "Role permission already exists",
          statuscode: 400,
        };
      }

      // Create role permission
      const [result] = await connection.execute(
        `INSERT INTO ${ROLE_PERMISSIONS_TABLE} (role_id, permission_id, is_allowed, created_at) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [request.role_id, request.permission_id, request.is_allowed],
      );

      await connection.end();

      return {
        status: true,
        message: "Role permission created successfully",
        data: {
          role_id: request.role_id,
          permission_id: request.permission_id,
          is_allowed: request.is_allowed,
          created_at: new Date(),
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Create role permission error:", error);
      return {
        status: false,
        message: "Failed to create role permission",
        statuscode: 500,
      };
    }
  }

  /**
   * Update an existing role permission
   */
  async updateRolePermission(
    request: UpdateRolePermissionRequest,
  ): Promise<RolePermissionResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if role permission exists
      const [existing] = await connection.execute(
        `SELECT * FROM ${ROLE_PERMISSIONS_TABLE} WHERE role_id = ? AND permission_id = ?`,
        [request.role_id, request.permission_id],
      );

      if ((existing as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "Role permission not found",
          statuscode: 404,
        };
      }

      if (request.is_allowed === undefined) {
        await connection.end();
        return {
          status: false,
          message: "No fields to update",
          statuscode: 400,
        };
      }

      // Update role permission
      const [result] = await connection.execute(
        `UPDATE ${ROLE_PERMISSIONS_TABLE} SET is_allowed = ? WHERE role_id = ? AND permission_id = ?`,
        [request.is_allowed, request.role_id, request.permission_id],
      );

      await connection.end();

      return {
        status: true,
        message: "Role permission updated successfully",
        data: {
          role_id: request.role_id,
          permission_id: request.permission_id,
          is_allowed: request.is_allowed,
          created_at: new Date(),
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Update role permission error:", error);
      return {
        status: false,
        message: "Failed to update role permission",
        statuscode: 500,
      };
    }
  }

  /**
   * Delete a role permission
   */
  async deleteRolePermission(
    request: DeleteRolePermissionRequest,
  ): Promise<RolePermissionResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if role permission exists
      const [existing] = await connection.execute(
        `SELECT * FROM ${ROLE_PERMISSIONS_TABLE} WHERE role_id = ? AND permission_id = ?`,
        [request.role_id, request.permission_id],
      );

      if ((existing as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "Role permission not found",
          statuscode: 404,
        };
      }

      // Delete role permission
      const [result] = await connection.execute(
        `DELETE FROM ${ROLE_PERMISSIONS_TABLE} WHERE role_id = ? AND permission_id = ?`,
        [request.role_id, request.permission_id],
      );

      await connection.end();

      return {
        status: true,
        message: "Role permission deleted successfully",
        data: {
          role_id: request.role_id,
          permission_id: request.permission_id,
          affectedRows: (result as any).affectedRows,
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Delete role permission error:", error);
      return {
        status: false,
        message: "Failed to delete role permission",
        statuscode: 500,
      };
    }
  }

  // ==================== USER ROLES CRUD OPERATIONS ====================

  /**
   * Get all user roles
   */
  async getAllUserRoles(): Promise<UserRolesResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      const [rows] = await connection.execute(
        `SELECT ur.*, u.email as user_email, r.role_name 
         FROM ${USER_ROLES_TABLE} ur
         LEFT JOIN ${USERS_TABLE} u ON ur.user_id = u.user_id
         LEFT JOIN ${ROLES_TABLE} r ON ur.role_id = r.role_id
         ORDER BY ur.user_id, ur.role_id`,
      );
      await connection.end();

      return {
        status: true,
        message: "User roles retrieved successfully",
        data: rows as any[],
      };
    } catch (error) {
      await connection.end();
      console.error("Get all user roles error:", error);
      return {
        status: false,
        message: "Failed to retrieve user roles",
        statuscode: 500,
      };
    }
  }

  /**
   * Create a new user role
   */
  async createUserRole(
    request: CreateUserRoleRequest,
  ): Promise<UserRoleResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if user exists
      const [userCheck] = await connection.execute(
        `SELECT user_id FROM ${USERS_TABLE} WHERE user_id = ?`,
        [request.user_id],
      );

      if ((userCheck as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "User not found",
          statuscode: 404,
        };
      }

      // Check if role exists
      const [roleCheck] = await connection.execute(
        `SELECT role_id FROM ${ROLES_TABLE} WHERE role_id = ?`,
        [request.role_id],
      );

      if ((roleCheck as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "Role not found",
          statuscode: 404,
        };
      }

      // Check if user role already exists
      const [existing] = await connection.execute(
        `SELECT * FROM ${USER_ROLES_TABLE} WHERE user_id = ? AND role_id = ?`,
        [request.user_id, request.role_id],
      );

      if ((existing as any[]).length > 0) {
        await connection.end();
        return {
          status: false,
          message: "User role already exists",
          statuscode: 400,
        };
      }

      // Create user role
      const [result] = await connection.execute(
        `INSERT INTO ${USER_ROLES_TABLE} (user_id, role_id, assigned_at, assigned_by) 
         VALUES (?, ?, CURRENT_TIMESTAMP, ?)`,
        [request.user_id, request.role_id, request.assigned_by ?? null],
      );

      await connection.end();

      return {
        status: true,
        message: "User role created successfully",
        data: {
          user_id: request.user_id,
          role_id: request.role_id,
          assigned_at: new Date(),
          assigned_by: request.assigned_by ?? null,
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Create user role error:", error);
      return {
        status: false,
        message: "Failed to create user role",
        statuscode: 500,
      };
    }
  }

  /**
   * Delete a user role
   */
  async deleteUserRole(
    request: DeleteUserRoleRequest,
  ): Promise<UserRoleResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if user role exists
      const [existing] = await connection.execute(
        `SELECT * FROM ${USER_ROLES_TABLE} WHERE user_id = ? AND role_id = ?`,
        [request.user_id, request.role_id],
      );

      if ((existing as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "User role not found",
          statuscode: 404,
        };
      }

      // Delete user role
      const [result] = await connection.execute(
        `DELETE FROM ${USER_ROLES_TABLE} WHERE user_id = ? AND role_id = ?`,
        [request.user_id, request.role_id],
      );

      await connection.end();

      return {
        status: true,
        message: "User role deleted successfully",
        data: {
          user_id: request.user_id,
          role_id: request.role_id,
          affectedRows: (result as any).affectedRows,
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Delete user role error:", error);
      return {
        status: false,
        message: "Failed to delete user role",
        statuscode: 500,
      };
    }
  }

  // ==================== USER SECURITY FLAGS CRUD OPERATIONS ====================

  /**
   * Get all user security flags
   */
  async getAllUserSecurityFlags(): Promise<UserSecurityFlagsResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      const [rows] = await connection.execute(
        `SELECT usf.*, u.email as user_email 
         FROM ${USER_SECURITY_FLAGS_TABLE} usf
         LEFT JOIN ${USERS_TABLE} u ON usf.user_id = u.user_id
         ORDER BY usf.user_id`,
      );
      await connection.end();

      return {
        status: true,
        message: "User security flags retrieved successfully",
        data: rows as any[],
      };
    } catch (error) {
      await connection.end();
      console.error("Get all user security flags error:", error);
      return {
        status: false,
        message: "Failed to retrieve user security flags",
        statuscode: 500,
      };
    }
  }

  /**
   * Create a new user security flag
   */
  async createUserSecurityFlag(
    request: CreateUserSecurityFlagRequest,
  ): Promise<UserSecurityFlagResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if user exists
      const [userCheck] = await connection.execute(
        `SELECT user_id FROM ${USERS_TABLE} WHERE user_id = ?`,
        [request.user_id],
      );

      if ((userCheck as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "User not found",
          statuscode: 404,
        };
      }

      // Check if user security flag already exists
      const [existing] = await connection.execute(
        `SELECT * FROM ${USER_SECURITY_FLAGS_TABLE} WHERE user_id = ?`,
        [request.user_id],
      );

      if ((existing as any[]).length > 0) {
        await connection.end();
        return {
          status: false,
          message: "User security flag already exists",
          statuscode: 400,
        };
      }

      // Create user security flag
      const [result] = await connection.execute(
        `INSERT INTO ${USER_SECURITY_FLAGS_TABLE} (user_id, is_admin, bypass_otp, mfa_enrolled, updated_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          request.user_id,
          request.is_admin,
          request.bypass_otp,
          request.mfa_enrolled,
        ],
      );

      await connection.end();

      return {
        status: true,
        message: "User security flag created successfully",
        data: {
          user_id: request.user_id,
          is_admin: request.is_admin,
          bypass_otp: request.bypass_otp,
          mfa_enrolled: request.mfa_enrolled,
          updated_at: new Date(),
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Create user security flag error:", error);
      return {
        status: false,
        message: "Failed to create user security flag",
        statuscode: 500,
      };
    }
  }

  /**
   * Update an existing user security flag
   */
  async updateUserSecurityFlag(
    request: UpdateUserSecurityFlagRequest,
  ): Promise<UserSecurityFlagResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if user security flag exists
      const [existing] = await connection.execute(
        `SELECT * FROM ${USER_SECURITY_FLAGS_TABLE} WHERE user_id = ?`,
        [request.user_id],
      );

      if ((existing as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "User security flag not found",
          statuscode: 404,
        };
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];

      if (request.is_admin !== undefined) {
        updateFields.push("is_admin = ?");
        updateValues.push(request.is_admin);
      }

      if (request.bypass_otp !== undefined) {
        updateFields.push("bypass_otp = ?");
        updateValues.push(request.bypass_otp);
      }

      if (request.mfa_enrolled !== undefined) {
        updateFields.push("mfa_enrolled = ?");
        updateValues.push(request.mfa_enrolled);
      }

      if (updateFields.length === 0) {
        await connection.end();
        return {
          status: false,
          message: "No fields to update",
          statuscode: 400,
        };
      }

      updateFields.push("updated_at = CURRENT_TIMESTAMP");
      updateValues.push(request.user_id);

      const [result] = await connection.execute(
        `UPDATE ${USER_SECURITY_FLAGS_TABLE} SET ${updateFields.join(", ")} WHERE user_id = ?`,
        updateValues,
      );

      await connection.end();

      return {
        status: true,
        message: "User security flag updated successfully",
        data: {
          user_id: request.user_id,
          is_admin: request.is_admin ?? 0,
          bypass_otp: request.bypass_otp ?? 0,
          mfa_enrolled: request.mfa_enrolled ?? 0,
          updated_at: new Date(),
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Update user security flag error:", error);
      return {
        status: false,
        message: "Failed to update user security flag",
        statuscode: 500,
      };
    }
  }

  /**
   * Delete a user security flag
   */
  async deleteUserSecurityFlag(
    request: DeleteUserSecurityFlagRequest,
  ): Promise<UserSecurityFlagResponse> {
    const connection = await getConnection();
    if (!connection) {
      return {
        status: false,
        message: "Database connection failed",
        statuscode: 500,
      };
    }

    try {
      // Check if user security flag exists
      const [existing] = await connection.execute(
        `SELECT * FROM ${USER_SECURITY_FLAGS_TABLE} WHERE user_id = ?`,
        [request.user_id],
      );

      if ((existing as any[]).length === 0) {
        await connection.end();
        return {
          status: false,
          message: "User security flag not found",
          statuscode: 404,
        };
      }

      // Delete user security flag
      const [result] = await connection.execute(
        `DELETE FROM ${USER_SECURITY_FLAGS_TABLE} WHERE user_id = ?`,
        [request.user_id],
      );

      await connection.end();

      return {
        status: true,
        message: "User security flag deleted successfully",
        data: {
          user_id: request.user_id,
          affectedRows: (result as any).affectedRows,
        },
      };
    } catch (error) {
      await connection.end();
      console.error("Delete user security flag error:", error);
      return {
        status: false,
        message: "Failed to delete user security flag",
        statuscode: 500,
      };
    }
  }
}
