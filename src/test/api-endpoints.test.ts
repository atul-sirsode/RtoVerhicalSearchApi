import axios from "axios";

const BASE_URL = "http://localhost:3000/api/users";

// Test data
const testUser = {
  username: "test_api_user_001",
  display_name: "Test API User 001",
  email: "testapiuser001@example.com",
  password: "testPassword123",
  is_active: 1,
  jwt_secret: "test-api-jwt-secret",
  partner_id: "TEST-API-PARTNER-001",
};

const testPermission = {
  perm_key: "menu.test_api_permission",
  perm_name: "Test API Permission",
  category: "Menu",
  description: "Test permission for API endpoints",
};

const testRole = {
  role_key: "test_api_role",
  role_name: "Test API Role",
  is_system_role: 0,
};

// Helper function to make API requests
async function apiRequest(method: string, endpoint: string, data?: any) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      ...(data && { data }),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

async function testApiEndpoints() {
  console.log("=== API Endpoints Test ===\n");

  // ==================== USER CRUD API TESTS ====================

  console.log("1. Testing User CRUD API Endpoints:");

  // Test Create User
  console.log("\n1.1 Testing Create User API:");
  const createUserResult = await apiRequest("POST", "/create", testUser);
  console.log("Create User API Result:", {
    success: createUserResult.success,
    status: createUserResult.status,
    data: createUserResult.success ? createUserResult.data : createUserResult.error,
  });

  let createdUserId = null;
  if (createUserResult.success && createUserResult.data?.data?.user_id) {
    createdUserId = createUserResult.data.data.user_id;

    // Test Update User
    console.log("\n1.2 Testing Update User API:");
    const updateUserResult = await apiRequest("PUT", "/update", {
      user_id: createdUserId,
      display_name: "Test API User 001 - Updated",
      email: "testapiuser001-updated@example.com",
    });
    console.log("Update User API Result:", {
      success: updateUserResult.success,
      status: updateUserResult.status,
      data: updateUserResult.success ? updateUserResult.data : updateUserResult.error,
    });

    // Test Get All Active Users
    console.log("\n1.3 Testing Get All Active Users API:");
    const getAllUsersResult = await apiRequest("GET", "/get-all-active-users");
    console.log("Get All Users API Result:", {
      success: getAllUsersResult.success,
      status: getAllUsersResult.status,
      data: getAllUsersResult.success ? 
        `${getAllUsersResult.data.data?.length || 0} users found` : 
        getAllUsersResult.error,
    });

    // Test Delete User
    console.log("\n1.4 Testing Delete User API:");
    const deleteUserResult = await apiRequest("DELETE", "/delete", {
      user_id: createdUserId,
    });
    console.log("Delete User API Result:", {
      success: deleteUserResult.success,
      status: deleteUserResult.status,
      data: deleteUserResult.success ? deleteUserResult.data : deleteUserResult.error,
    });
  }

  // ==================== PERMISSION CRUD API TESTS ====================

  console.log("\n\n2. Testing Permission CRUD API Endpoints:");

  // Test Get All Permissions
  console.log("\n2.1 Testing Get All Permissions API:");
  const getAllPermissionsResult = await apiRequest("GET", "/permissions");
  console.log("Get All Permissions API Result:", {
    success: getAllPermissionsResult.success,
    status: getAllPermissionsResult.status,
    data: getAllPermissionsResult.success ? 
      `${getAllPermissionsResult.data.data?.length || 0} permissions found` : 
      getAllPermissionsResult.error,
  });

  // Test Create Permission
  console.log("\n2.2 Testing Create Permission API:");
  const createPermissionResult = await apiRequest("POST", "/permissions/create", testPermission);
  console.log("Create Permission API Result:", {
    success: createPermissionResult.success,
    status: createPermissionResult.status,
    data: createPermissionResult.success ? createPermissionResult.data : createPermissionResult.error,
  });

  let createdPermissionId = null;
  if (createPermissionResult.success && createPermissionResult.data?.data?.permission_id) {
    createdPermissionId = createPermissionResult.data.data.permission_id;

    // Test Update Permission
    console.log("\n2.3 Testing Update Permission API:");
    const updatePermissionResult = await apiRequest("PUT", "/permissions/update", {
      permission_id: createdPermissionId,
      perm_name: "Test API Permission - Updated",
      description: "Updated test permission description",
    });
    console.log("Update Permission API Result:", {
      success: updatePermissionResult.success,
      status: updatePermissionResult.status,
      data: updatePermissionResult.success ? updatePermissionResult.data : updatePermissionResult.error,
    });

    // Test Delete Permission
    console.log("\n2.4 Testing Delete Permission API:");
    const deletePermissionResult = await apiRequest("DELETE", "/permissions/delete", {
      permission_id: createdPermissionId,
    });
    console.log("Delete Permission API Result:", {
      success: deletePermissionResult.success,
      status: deletePermissionResult.status,
      data: deletePermissionResult.success ? deletePermissionResult.data : deletePermissionResult.error,
    });
  }

  // ==================== ROLE CRUD API TESTS ====================

  console.log("\n\n3. Testing Role CRUD API Endpoints:");

  // Test Get All Roles
  console.log("\n3.1 Testing Get All Roles API:");
  const getAllRolesResult = await apiRequest("GET", "/roles");
  console.log("Get All Roles API Result:", {
    success: getAllRolesResult.success,
    status: getAllRolesResult.status,
    data: getAllRolesResult.success ? 
      `${getAllRolesResult.data.data?.length || 0} roles found` : 
      getAllRolesResult.error,
  });

  // Test Create Role
  console.log("\n3.2 Testing Create Role API:");
  const createRoleResult = await apiRequest("POST", "/roles/create", testRole);
  console.log("Create Role API Result:", {
    success: createRoleResult.success,
    status: createRoleResult.status,
    data: createRoleResult.success ? createRoleResult.data : createRoleResult.error,
  });

  let createdRoleId = null;
  if (createRoleResult.success && createRoleResult.data?.data?.role_id) {
    createdRoleId = createRoleResult.data.data.role_id;

    // Test Update Role
    console.log("\n3.3 Testing Update Role API:");
    const updateRoleResult = await apiRequest("PUT", "/roles/update", {
      role_id: createdRoleId,
      role_name: "Test API Role - Updated",
    });
    console.log("Update Role API Result:", {
      success: updateRoleResult.success,
      status: updateRoleResult.status,
      data: updateRoleResult.success ? updateRoleResult.data : updateRoleResult.error,
    });

    // Test Delete Role
    console.log("\n3.4 Testing Delete Role API:");
    const deleteRoleResult = await apiRequest("DELETE", "/roles/delete", {
      role_id: createdRoleId,
    });
    console.log("Delete Role API Result:", {
      success: deleteRoleResult.success,
      status: deleteRoleResult.status,
      data: deleteRoleResult.success ? deleteRoleResult.data : deleteRoleResult.error,
    });
  }

  // ==================== ERROR HANDLING API TESTS ====================

  console.log("\n\n4. Testing Error Handling API Endpoints:");

  // Test Create User with Duplicate Data
  console.log("\n4.1 Testing Create User with Duplicate Username:");
  const duplicateUserResult = await apiRequest("POST", "/create", {
    username: "transcologistic0011", // This should already exist
    display_name: "Duplicate User",
    email: "duplicate@example.com",
    password: "password123",
  });
  console.log("Duplicate User API Result:", {
    success: duplicateUserResult.success,
    status: duplicateUserResult.status,
    data: duplicateUserResult.success ? duplicateUserResult.data : duplicateUserResult.error,
  });

  // Test Update Non-existent User
  console.log("\n4.2 Testing Update Non-existent User:");
  const nonExistentUpdateResult = await apiRequest("PUT", "/update", {
    user_id: 99999,
    display_name: "Non-existent User",
  });
  console.log("Non-existent User Update API Result:", {
    success: nonExistentUpdateResult.success,
    status: nonExistentUpdateResult.status,
    data: nonExistentUpdateResult.success ? nonExistentUpdateResult.data : nonExistentUpdateResult.error,
  });

  // Test Delete Non-existent User
  console.log("\n4.3 Testing Delete Non-existent User:");
  const nonExistentDeleteResult = await apiRequest("DELETE", "/delete", {
    user_id: 99999,
  });
  console.log("Non-existent User Delete API Result:", {
    success: nonExistentDeleteResult.success,
    status: nonExistentDeleteResult.status,
    data: nonExistentDeleteResult.success ? nonExistentDeleteResult.data : nonExistentDeleteResult.error,
  });

  // Test Create Permission with Duplicate Key
  console.log("\n4.4 Testing Create Permission with Duplicate Key:");
  const duplicatePermissionResult = await apiRequest("POST", "/permissions/create", {
    perm_key: "menu.rc_verification", // This should already exist
    perm_name: "Duplicate Permission",
    category: "Menu",
  });
  console.log("Duplicate Permission API Result:", {
    success: duplicatePermissionResult.success,
    status: duplicatePermissionResult.status,
    data: duplicatePermissionResult.success ? duplicatePermissionResult.data : duplicatePermissionResult.error,
  });

  // Test Create Role with Duplicate Key
  console.log("\n4.5 Testing Create Role with Duplicate Key:");
  const duplicateRoleResult = await apiRequest("POST", "/roles/create", {
    role_key: "admin", // This should already exist
    role_name: "Duplicate Admin Role",
  });
  console.log("Duplicate Role API Result:", {
    success: duplicateRoleResult.success,
    status: duplicateRoleResult.status,
    data: duplicateRoleResult.success ? duplicateRoleResult.data : duplicateRoleResult.error,
  });

  // Test Modify System Role
  console.log("\n4.6 Testing Modify System Role:");
  const modifySystemRoleResult = await apiRequest("PUT", "/roles/update", {
    role_id: 1, // Admin role should be system role
    role_name: "Modified Admin Role",
  });
  console.log("Modify System Role API Result:", {
    success: modifySystemRoleResult.success,
    status: modifySystemRoleResult.status,
    data: modifySystemRoleResult.success ? modifySystemRoleResult.data : modifySystemRoleResult.error,
  });

  // Test Delete System Role
  console.log("\n4.7 Testing Delete System Role:");
  const deleteSystemRoleResult = await apiRequest("DELETE", "/roles/delete", {
    role_id: 1, // Admin role should be system role
  });
  console.log("Delete System Role API Result:", {
    success: deleteSystemRoleResult.success,
    status: deleteSystemRoleResult.status,
    data: deleteSystemRoleResult.success ? deleteSystemRoleResult.data : deleteSystemRoleResult.error,
  });

  console.log("\n=== API Endpoints Test Complete ===");
}

// Check if server is running before starting tests
async function checkServerAndRunTests() {
  try {
    console.log("Checking if server is running...");
    await axios.get(`${BASE_URL}/get-all-active-users`);
    console.log("Server is running. Starting API tests...\n");
    await testApiEndpoints();
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.log("❌ Server is not running. Please start the server with 'npm run start' before running API tests.");
    } else {
      console.log("❌ Error connecting to server:", error.message);
    }
  }
}

// Run the tests
checkServerAndRunTests().catch(console.error);
