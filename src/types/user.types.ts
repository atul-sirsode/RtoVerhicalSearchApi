// User Management Types

export interface User {
  user_id: number;
  username: string;
  display_name: string;
  email: string | null;
  password_hash: string;
  is_active: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  jwt_secret: string | null;
  partner_id: string | null;
}

export interface Role {
  role_id: number;
  role_key: string;
  role_name: string;
  is_system_role: number;
  created_at: Date;
  updated_at: Date;
}

export interface Permission {
  permission_id: number;
  perm_key: string;
  perm_name: string;
  category: string | null;
  description: string | null;
}

export interface RolePermission {
  role_id: number;
  permission_id: number;
  is_allowed: number;
  created_at: Date;
}

export interface UserRole {
  user_id: number;
  role_id: number;
  assigned_at: Date;
  assigned_by: number | null;
}

export interface UserPermission {
  user_id: number;
  permission_id: number;
  is_allowed: number;
  note: string | null;
  updated_at: Date;
}

export interface UserSecurityFlag {
  user_id: number;
  is_admin: number;
  bypass_otp: number;
  mfa_enrolled: number;
  updated_at: Date;
}

// Request/Response Types
export interface GetUserInfoRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: number;
  username: string;
  display_name: string;
  email: string;
  is_active: number;
  is_admin: number;
  bypass_otp: number;
  jwt_secret: string | null;
  partner_id: string | null;
  token?: string;
  last_login: Date;
}

export interface GetUserInfoResponse {
  user_id: number;
  username: string;
  display_name: string;
  email: string | null;
  is_active: number;
  is_admin: number;
  bypass_otp: number;
  jwt_secret: string | null;
  partner_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface GetUserPermissionsRequest {
  email: string;
}

export interface PermissionWithStatus {
  permission_id: number;
  perm_key: string;
  perm_name: string;
  category: string | null;
  is_allowed: number;
}

export interface GetUserPermissionsResponse {
  user_id: number;
  permissions: PermissionWithStatus[];
  security_flags: {
    is_admin: number;
    bypass_otp: number;
  };
}

export interface UserApiResponse {
  status: boolean;
  message: string;
  data?: any;
  statuscode?: number;
}

// Database Query Results
export interface UserPermissionQueryResult {
  permission_id: number;
  perm_key: string;
  perm_name: string;
  category: string | null;
  is_allowed: number;
}

export interface UserSecurityFlagsQueryResult {
  is_admin: number;
  bypass_otp: number;
}

// CRUD Request/Response Types

// User CRUD
export interface CreateUserRequest {
  username: string;
  display_name: string;
  email: string | null;
  password: string;
  is_active?: number;
  jwt_secret?: string | null;
  partner_id?: string | null;
}

export interface UpdateUserRequest {
  user_id: number;
  username?: string;
  display_name?: string;
  email?: string | null;
  password?: string;
  is_active?: number;
  jwt_secret?: string | null;
  partner_id?: string | null;
}

export interface DeleteUserRequest {
  user_id: number;
}

// Permission CRUD
export interface CreatePermissionRequest {
  perm_key: string;
  perm_name: string;
  category?: string | null;
  description?: string | null;
}

export interface UpdatePermissionRequest {
  permission_id: number;
  perm_key?: string;
  perm_name?: string;
  category?: string | null;
  description?: string | null;
}

export interface DeletePermissionRequest {
  permission_id: number;
}

// Role CRUD
export interface CreateRoleRequest {
  role_key: string;
  role_name: string;
  is_system_role?: number;
}

export interface UpdateRoleRequest {
  role_id: number;
  role_key?: string;
  role_name?: string;
  is_system_role?: number;
}

export interface DeleteRoleRequest {
  role_id: number;
}

// CRUD Response Types
export interface CreateUserResponse extends User {
  message: string;
}

export interface UpdateUserResponse extends User {
  message: string;
}

export interface DeleteUserResponse {
  user_id: number;
  message: string;
}

export interface CreatePermissionResponse extends Permission {
  message: string;
}

export interface UpdatePermissionResponse extends Permission {
  message: string;
}

export interface DeletePermissionResponse {
  permission_id: number;
  message: string;
}

export interface CreateRoleResponse extends Role {
  message: string;
}

export interface UpdateRoleResponse extends Role {
  message: string;
}

export interface DeleteRoleResponse {
  role_id: number;
  message: string;
}

// ==================== BANK TYPES ====================

// Bank entity
export interface Bank {
  id: string;
  name: string;
  enabled: number; // TINYINT(1) - 0 or 1
  created_at: Date;
  updated_at: Date;
}

// Bank CRUD Request/Response types
export interface CreateBankRequest {
  id: string;
  name: string;
  enabled?: number; // Optional, defaults to 1
}

export interface UpdateBankRequest {
  id: string;
  name?: string;
  enabled?: number;
}

export interface DeleteBankRequest {
  id: string;
}

export interface BankResponse extends UserApiResponse {
  data?: Bank | { id: string; affectedRows: number };
}

export interface BanksResponse extends UserApiResponse {
  data?: Bank[];
}

// ==================== USER PERMISSIONS TYPES ====================

// User Permission entity
export interface UserPermission {
  user_id: number;
  permission_id: number;
  is_allowed: number; // TINYINT(1) - 0 or 1
  note: string | null; // NULL in database
  updated_at: Date;
}

// User Permission CRUD Request/Response types
export interface CreateUserPermissionRequest {
  user_id: number;
  permission_id: number;
  is_allowed: number;
  note?: string | null;
}

export interface UpdateUserPermissionRequest {
  user_id: number;
  permission_id: number;
  is_allowed?: number;
  note?: string | null;
}

export interface DeleteUserPermissionRequest {
  user_id: number;
  permission_id: number;
}

export interface UserPermissionResponse extends UserApiResponse {
  data?:
    | UserPermission
    | { user_id: number; permission_id: number; affectedRows: number };
}

export interface UserPermissionsResponse extends UserApiResponse {
  data?: UserPermission[];
}

// ==================== ROLE PERMISSIONS TYPES ====================

// Role Permission entity
export interface RolePermission {
  role_id: number;
  permission_id: number;
  is_allowed: number; // TINYINT(1) - 0 or 1
  created_at: Date;
}

// Role Permission CRUD Request/Response types
export interface CreateRolePermissionRequest {
  role_id: number;
  permission_id: number;
  is_allowed: number;
}

export interface UpdateRolePermissionRequest {
  role_id: number;
  permission_id: number;
  is_allowed?: number;
}

export interface DeleteRolePermissionRequest {
  role_id: number;
  permission_id: number;
}

export interface RolePermissionResponse extends UserApiResponse {
  data?:
    | RolePermission
    | { role_id: number; permission_id: number; affectedRows: number };
}

export interface RolePermissionsResponse extends UserApiResponse {
  data?: RolePermission[];
}

// ==================== USER ROLES TYPES ====================

// User Role entity
export interface UserRole {
  user_id: number;
  role_id: number;
  assigned_at: Date;
  assigned_by: number | null; // NULL in database
}

// User Role CRUD Request/Response types
export interface CreateUserRoleRequest {
  user_id: number;
  role_id: number;
  assigned_by?: number | null;
}

export interface DeleteUserRoleRequest {
  user_id: number;
  role_id: number;
}

export interface UserRoleResponse extends UserApiResponse {
  data?: UserRole | { user_id: number; role_id: number; affectedRows: number };
}

export interface UserRolesResponse extends UserApiResponse {
  data?: UserRole[];
}

// ==================== USER SECURITY FLAGS TYPES ====================

// User Security Flag entity
export interface UserSecurityFlag {
  user_id: number;
  is_admin: number; // TINYINT(1) - 0 or 1
  bypass_otp: number; // TINYINT(1) - 0 or 1
  mfa_enrolled: number; // TINYINT(1) - 0 or 1
  updated_at: Date;
}

// User Security Flag CRUD Request/Response types
export interface CreateUserSecurityFlagRequest {
  user_id: number;
  is_admin: number;
  bypass_otp: number;
  mfa_enrolled: number;
}

export interface UpdateUserSecurityFlagRequest {
  user_id: number;
  is_admin?: number;
  bypass_otp?: number;
  mfa_enrolled?: number;
}

export interface DeleteUserSecurityFlagRequest {
  user_id: number;
}

export interface UserSecurityFlagResponse extends UserApiResponse {
  data?: UserSecurityFlag | { user_id: number; affectedRows: number };
}

export interface UserSecurityFlagsResponse extends UserApiResponse {
  data?: UserSecurityFlag[];
}
