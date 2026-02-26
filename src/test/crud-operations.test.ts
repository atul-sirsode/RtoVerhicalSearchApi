import { UserService } from "../services/user.service.js";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  DeletePermissionRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  DeleteRoleRequest,
} from "../types/user.types.js";

async function testCrudOperations() {
  console.log("=== CRUD Operations Test ===\n");

  const userService = new UserService();

  // ==================== USER CRUD TESTS ====================

  console.log("1. Testing User CRUD Operations:");

  // Test Create User
  console.log("\n1.1 Testing Create User:");
  const createUserRequest: CreateUserRequest = {
    username: "testuser001",
    display_name: "Test User 001",
    email: "testuser001@example.com",
    password: "testpassword123",
    is_active: 1,
    jwt_secret: "test-jwt-secret-001",
    partner_id: "TEST-PARTNER-001",
  };

  const createResult = await userService.createUser(createUserRequest);
  console.log("Create User Result:", {
    status: createResult.status,
    message: createResult.message,
    data: createResult.data,
  });

  if (createResult.status && createResult.data?.user_id) {
    const newUserId = createResult.data.user_id;

    // Test Update User
    console.log("\n1.2 Testing Update User:");
    const updateUserRequest: UpdateUserRequest = {
      user_id: newUserId,
      display_name: "Test User 001 - Updated",
      email: "testuser001-updated@example.com",
    };

    const updateResult = await userService.updateUser(updateUserRequest);
    console.log("Update User Result:", {
      status: updateResult.status,
      message: updateResult.message,
      data: updateResult.data,
    });

    // Test Get User Info
    console.log("\n1.3 Testing Get User Info:");
    const userInfoResult = await userService.getUserInfo({ email: "testuser001-updated@example.com" });
    console.log("Get User Info Result:", {
      status: userInfoResult.status,
      message: userInfoResult.message,
      data: userInfoResult.data,
    });

    // Test Delete User
    console.log("\n1.4 Testing Delete User:");
    const deleteUserRequest: DeleteUserRequest = {
      user_id: newUserId,
    };

    const deleteResult = await userService.deleteUser(deleteUserRequest);
    console.log("Delete User Result:", {
      status: deleteResult.status,
      message: deleteResult.message,
      data: deleteResult.data,
    });
  }

  // ==================== PERMISSION CRUD TESTS ====================

  console.log("\n\n2. Testing Permission CRUD Operations:");

  // Test Get All Permissions
  console.log("\n2.1 Testing Get All Permissions:");
  const allPermissions = await userService.getAllPermissions();
  console.log("All Permissions:", allPermissions.length, "permissions found");
  allPermissions.forEach((perm, index) => {
    console.log(`  ${index + 1}. ${perm.perm_name} (${perm.perm_key}) - ${perm.category || 'No category'}`);
  });

  // Test Create Permission
  console.log("\n2.2 Testing Create Permission:");
  const createPermissionRequest: CreatePermissionRequest = {
    perm_key: "menu.test_permission",
    perm_name: "Test Permission",
    category: "Menu",
    description: "Test permission for CRUD operations",
  };

  const createPermResult = await userService.createPermission(createPermissionRequest);
  console.log("Create Permission Result:", {
    status: createPermResult.status,
    message: createPermResult.message,
    data: createPermResult.data,
  });

  if (createPermResult.status && createPermResult.data?.permission_id) {
    const newPermissionId = createPermResult.data.permission_id;

    // Test Update Permission
    console.log("\n2.3 Testing Update Permission:");
    const updatePermissionRequest: UpdatePermissionRequest = {
      permission_id: newPermissionId,
      perm_name: "Test Permission - Updated",
      description: "Updated test permission description",
    };

    const updatePermResult = await userService.updatePermission(updatePermissionRequest);
    console.log("Update Permission Result:", {
      status: updatePermResult.status,
      message: updatePermResult.message,
      data: updatePermResult.data,
    });

    // Test Delete Permission
    console.log("\n2.4 Testing Delete Permission:");
    const deletePermissionRequest: DeletePermissionRequest = {
      permission_id: newPermissionId,
    };

    const deletePermResult = await userService.deletePermission(deletePermissionRequest);
    console.log("Delete Permission Result:", {
      status: deletePermResult.status,
      message: deletePermResult.message,
      data: deletePermResult.data,
    });
  }

  // ==================== ROLE CRUD TESTS ====================

  console.log("\n\n3. Testing Role CRUD Operations:");

  // Test Get All Roles
  console.log("\n3.1 Testing Get All Roles:");
  const allRoles = await userService.getAllRoles();
  console.log("All Roles:", allRoles.length, "roles found");
  allRoles.forEach((role, index) => {
    console.log(`  ${index + 1}. ${role.role_name} (${role.role_key}) - System: ${role.is_system_role === 1 ? 'Yes' : 'No'}`);
  });

  // Test Create Role
  console.log("\n3.2 Testing Create Role:");
  const createRoleRequest: CreateRoleRequest = {
    role_key: "test_role",
    role_name: "Test Role",
    is_system_role: 0,
  };

  const createRoleResult = await userService.createRole(createRoleRequest);
  console.log("Create Role Result:", {
    status: createRoleResult.status,
    message: createRoleResult.message,
    data: createRoleResult.data,
  });

  if (createRoleResult.status && createRoleResult.data?.role_id) {
    const newRoleId = createRoleResult.data.role_id;

    // Test Update Role
    console.log("\n3.3 Testing Update Role:");
    const updateRoleRequest: UpdateRoleRequest = {
      role_id: newRoleId,
      role_name: "Test Role - Updated",
    };

    const updateRoleResult = await userService.updateRole(updateRoleRequest);
    console.log("Update Role Result:", {
      status: updateRoleResult.status,
      message: updateRoleResult.message,
      data: updateRoleResult.data,
    });

    // Test Delete Role
    console.log("\n3.4 Testing Delete Role:");
    const deleteRoleRequest: DeleteRoleRequest = {
      role_id: newRoleId,
    };

    const deleteRoleResult = await userService.deleteRole(deleteRoleRequest);
    console.log("Delete Role Result:", {
      status: deleteRoleResult.status,
      message: deleteRoleResult.message,
      data: deleteRoleResult.data,
    });
  }

  // ==================== ERROR HANDLING TESTS ====================

  console.log("\n\n4. Testing Error Handling:");

  // Test Create User with Duplicate Username
  console.log("\n4.1 Testing Create User with Duplicate Username:");
  const duplicateUserRequest: CreateUserRequest = {
    username: "transcologistic0011", // This should already exist
    display_name: "Duplicate User",
    email: "duplicate@example.com",
    password: "password123",
  };

  const duplicateResult = await userService.createUser(duplicateUserRequest);
  console.log("Duplicate User Result:", {
    status: duplicateResult.status,
    message: duplicateResult.message,
    statuscode: duplicateResult.statuscode,
  });

  // Test Update Non-existent User
  console.log("\n4.2 Testing Update Non-existent User:");
  const updateNonExistentUserRequest: UpdateUserRequest = {
    user_id: 99999,
    display_name: "Non-existent User",
  };

  const nonExistentUpdateResult = await userService.updateUser(updateNonExistentUserRequest);
  console.log("Non-existent User Update Result:", {
    status: nonExistentUpdateResult.status,
    message: nonExistentUpdateResult.message,
    statuscode: nonExistentUpdateResult.statuscode,
  });

  // Test Delete Non-existent User
  console.log("\n4.3 Testing Delete Non-existent User:");
  const deleteNonExistentUserRequest: DeleteUserRequest = {
    user_id: 99999,
  };

  const nonExistentDeleteResult = await userService.deleteUser(deleteNonExistentUserRequest);
  console.log("Non-existent User Delete Result:", {
    status: nonExistentDeleteResult.status,
    message: nonExistentDeleteResult.message,
    statuscode: nonExistentDeleteResult.statuscode,
  });

  // Test Create Permission with Duplicate Key
  console.log("\n4.4 Testing Create Permission with Duplicate Key:");
  const duplicatePermissionRequest: CreatePermissionRequest = {
    perm_key: "menu.rc_verification", // This should already exist
    perm_name: "Duplicate Permission",
    category: "Menu",
  };

  const duplicatePermResult = await userService.createPermission(duplicatePermissionRequest);
  console.log("Duplicate Permission Result:", {
    status: duplicatePermResult.status,
    message: duplicatePermResult.message,
    statuscode: duplicatePermResult.statuscode,
  });

  // Test Create Role with Duplicate Key
  console.log("\n4.5 Testing Create Role with Duplicate Key:");
  const duplicateRoleRequest: CreateRoleRequest = {
    role_key: "admin", // This should already exist
    role_name: "Duplicate Admin Role",
  };

  const duplicateRoleResult = await userService.createRole(duplicateRoleRequest);
  console.log("Duplicate Role Result:", {
    status: duplicateRoleResult.status,
    message: duplicateRoleResult.message,
    statuscode: duplicateRoleResult.statuscode,
  });

  // Test Modify System Role
  console.log("\n4.6 Testing Modify System Role:");
  const adminRole = allRoles.find(role => role.role_key === "admin");
  if (adminRole) {
    const modifySystemRoleRequest: UpdateRoleRequest = {
      role_id: adminRole.role_id,
      role_name: "Modified Admin Role",
    };

    const modifySystemResult = await userService.updateRole(modifySystemRoleRequest);
    console.log("Modify System Role Result:", {
      status: modifySystemResult.status,
      message: modifySystemResult.message,
      statuscode: modifySystemResult.statuscode,
    });
  }

  // Test Delete System Role
  console.log("\n4.7 Testing Delete System Role:");
  if (adminRole) {
    const deleteSystemRoleRequest: DeleteRoleRequest = {
      role_id: adminRole.role_id,
    };

    const deleteSystemResult = await userService.deleteRole(deleteSystemRoleRequest);
    console.log("Delete System Role Result:", {
      status: deleteSystemResult.status,
      message: deleteSystemResult.message,
      statuscode: deleteSystemResult.statuscode,
    });
  }

  console.log("\n=== CRUD Operations Test Complete ===");
}

// Run the test
testCrudOperations().catch(console.error);
