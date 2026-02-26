import { UserService } from "../services/user.service.js";

async function testUserService() {
  console.log("Testing User Service...");

  const userService = new UserService();

  try {
    // Test 1: Get user info by email
    console.log("\n1. Testing getUserInfo:");
    const userInfoRequest = {
      email: "transcologistic0011@gmail.com",
    };

    const userInfoResult = await userService.getUserInfo(userInfoRequest);
    console.log("Status:", userInfoResult.status);
    console.log("Message:", userInfoResult.message);

    if (userInfoResult.data) {
      console.log("User Info:");
      console.log("- User ID:", userInfoResult.data.user_id);
      console.log("- Username:", userInfoResult.data.username);
      console.log("- Display Name:", userInfoResult.data.display_name);
      console.log("- Email:", userInfoResult.data.email);
      console.log("- Is Active:", userInfoResult.data.is_active);
      console.log("- Is Admin:", userInfoResult.data.is_admin);
      console.log("- Bypass OTP:", userInfoResult.data.bypass_otp);
      console.log("- JWT Secret:", userInfoResult.data.jwt_secret);
      console.log("- Partner ID:", userInfoResult.data.partner_id);
      console.log("- Created:", userInfoResult.data.created_at);
    }

    // Test 2: Get user permissions by email
    console.log("\n2. Testing getUserPermissions:");
    const permissionsRequest = {
      email: "transcologistic0011@gmail.com",
    };

    const permissionsResult =
      await userService.getUserPermissions(permissionsRequest);
    console.log("Status:", permissionsResult.status);
    console.log("Message:", permissionsResult.message);

    if (permissionsResult.data) {
      console.log("User ID:", permissionsResult.data.user_id);
      console.log("Security Flags:");
      console.log(
        "- Is Admin:",
        permissionsResult.data.security_flags.is_admin,
      );
      console.log(
        "- Bypass OTP:",
        permissionsResult.data.security_flags.bypass_otp,
      );

      console.log("\nPermissions:");
      if (permissionsResult.data.permissions.length > 0) {
        permissionsResult.data.permissions.forEach(
          (perm: any, index: number) => {
            console.log(`${index + 1}. ${perm.perm_name} (${perm.perm_key})`);
            console.log(`   Category: ${perm.category || "N/A"}`);
            console.log(`   Allowed: ${perm.is_allowed ? "Yes" : "No"}`);
          },
        );
      } else {
        console.log("No permissions found");
      }
    }

    // Test 3: Get all active users
    console.log("\n3. Testing getAllActiveUsers:");
    const allUsersResult = await userService.getAllActiveUsers();

    console.log("Status:", "success");
    console.log("Message:", "Active users retrieved successfully");
    console.log("Total Active Users:", allUsersResult.length);

    if (allUsersResult.length > 0) {
      console.log("\nFirst 3 users:");
      allUsersResult.slice(0, 3).forEach((user: any, index: number) => {
        console.log(`User ${index + 1}:`);
        console.log("- ID:", user.user_id);
        console.log("- Username:", user.username);
        console.log("- Email:", user.email);
        console.log("- JWT Secret:", user.jwt_secret);
        console.log("- Partner ID:", user.partner_id);
        console.log("- Created:", user.created_at);
      });
    }

    // Test 4: Test with invalid email
    console.log("\n4. Testing with invalid email:");
    const invalidRequest = {
      email: "nonexistent@example.com",
    };

    const invalidResult = await userService.getUserInfo(invalidRequest);
    console.log("Status:", invalidResult.status);
    console.log("Message:", invalidResult.message);
    console.log("Status Code:", invalidResult.statuscode);

    // Test 5: Test with missing email
    console.log("\n5. Testing with missing email:");
    const missingEmailResult = await userService.getUserInfo({ email: "" });
    console.log("Status:", missingEmailResult.status);
    console.log("Message:", missingEmailResult.message);
    console.log("Status Code:", missingEmailResult.statuscode);

    console.log("\n✅ All User Service tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testUserService();
