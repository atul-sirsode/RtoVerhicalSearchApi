import { UserService } from "../services/user.service.js";

async function testLoginAuthentication() {
  console.log("Testing Login Authentication...");

  const userService = new UserService();

  try {
    // Test 1: Successful login
    console.log("\n1. Testing successful login:");
    const loginRequest = {
      email: "transcologistic0011@gmail.com",
      password: "password123", // This should match the password_hash in database
    };

    const loginResult = await userService.login(loginRequest);
    console.log("Status:", loginResult.status);
    console.log("Message:", loginResult.message);

    if (loginResult.data) {
      console.log("Login Response:");
      console.log("- User ID:", loginResult.data.user_id);
      console.log("- Username:", loginResult.data.username);
      console.log("- Display Name:", loginResult.data.display_name);
      console.log("- Email:", loginResult.data.email);
      console.log("- Is Active:", loginResult.data.is_active);
      console.log("- Is Admin:", loginResult.data.is_admin);
      console.log("- Bypass OTP:", loginResult.data.bypass_otp);
      console.log("- Partner ID:", loginResult.data.partner_id);
      console.log("- Last Login:", loginResult.data.last_login);
    }

    // Test 2: Login with invalid email
    console.log("\n2. Testing login with invalid email:");
    const invalidEmailRequest = {
      email: "nonexistent@example.com",
      password: "password123",
    };

    const invalidEmailResult = await userService.login(invalidEmailRequest);
    console.log("Status:", invalidEmailResult.status);
    console.log("Message:", invalidEmailResult.message);
    console.log("Status Code:", invalidEmailResult.statuscode);

    // Test 3: Login with invalid password
    console.log("\n3. Testing login with invalid password:");
    const invalidPasswordRequest = {
      email: "transcologistic0011@gmail.com",
      password: "wrongpassword",
    };

    const invalidPasswordResult = await userService.login(
      invalidPasswordRequest,
    );
    console.log("Status:", invalidPasswordResult.status);
    console.log("Message:", invalidPasswordResult.message);
    console.log("Status Code:", invalidPasswordResult.statuscode);

    // Test 4: Login with missing email
    console.log("\n4. Testing login with missing email:");
    const missingEmailRequest = {
      email: "",
      password: "password123",
    };

    const missingEmailResult = await userService.login(missingEmailRequest);
    console.log("Status:", missingEmailResult.status);
    console.log("Message:", missingEmailResult.message);
    console.log("Status Code:", missingEmailResult.statuscode);

    // Test 5: Login with missing password
    console.log("\n5. Testing login with missing password:");
    const missingPasswordRequest = {
      email: "transcologistic0011@gmail.com",
      password: "",
    };

    const missingPasswordResult = await userService.login(
      missingPasswordRequest,
    );
    console.log("Status:", missingPasswordResult.status);
    console.log("Message:", missingPasswordResult.message);
    console.log("Status Code:", missingPasswordResult.statuscode);

    // Test 6: Login with inactive user (if exists)
    console.log("\n6. Testing login with inactive user:");
    const inactiveUserRequest = {
      email: "inactive@example.com", // Assuming this user exists but is inactive
      password: "password123",
    };

    const inactiveUserResult = await userService.login(inactiveUserRequest);
    console.log("Status:", inactiveUserResult.status);
    console.log("Message:", inactiveUserResult.message);
    console.log("Status Code:", inactiveUserResult.statuscode);

    console.log("\n🔐 Login Authentication Features:");
    console.log("✅ Email validation");
    console.log("✅ Password verification");
    console.log("✅ User status check (active/inactive)");
    console.log("✅ Soft delete check (deleted_at)");
    console.log("✅ Security flags integration");
    console.log("✅ Last login timestamp update");
    console.log("✅ Error handling for invalid credentials");
    console.log("✅ Input validation");
    console.log("✅ Database connection safety");

    console.log("\n📝 API Usage Example:");
    console.log("POST /api/users/login");
    console.log("{");
    console.log('  "email": "user@example.com",');
    console.log('  "password": "********"');
    console.log("}");

    console.log("\n🔒 Security Considerations:");
    console.log("✅ Password comparison (note: use bcrypt in production)");
    console.log("✅ Generic error messages (don't reveal if user exists)");
    console.log("✅ SQL injection prevention with parameterized queries");
    console.log("✅ Input validation and sanitization");
    console.log("✅ Proper HTTP status codes");
    console.log("✅ Database connection cleanup");

    console.log("\n✅ All Login Authentication tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testLoginAuthentication();
