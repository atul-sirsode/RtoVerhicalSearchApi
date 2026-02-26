import { JwtService } from "../services/jwt.service.js";

async function testJwtService() {
  console.log("=== JWT Service Test ===\n");

  const jwtService = new JwtService();

  // Test 1: Generate token with user-specific secret and partner ID
  console.log(
    "1. Testing JWT token generation with user-specific credentials:",
  );
  const userJwtSecret = "user-specific-jwt-secret-key";
  const userPartnerId = "partner-123";
  const userId = 123;
  const userEmail = "test@example.com";

  const tokenResponse = jwtService.generateToken(
    userJwtSecret,
    userPartnerId,
    userId,
    userEmail,
  );

  console.log("Generated Token:", tokenResponse.token);
  console.log("Token Payload:");
  console.log("- Timestamp:", tokenResponse.payload.timestamp);
  console.log("- Partner ID:", tokenResponse.payload.partnerId);
  console.log("- Request ID:", tokenResponse.payload.reqid);
  console.log("- User ID:", tokenResponse.payload.userId);
  console.log("- Email:", tokenResponse.payload.email);
  console.log("");

  // Test 2: Verify token with correct secret
  console.log("2. Testing token verification with correct secret:");
  const verifiedToken = jwtService.verifyToken(
    tokenResponse.token,
    userJwtSecret,
  );

  if (verifiedToken) {
    console.log("✅ Token verification successful");
    console.log("Verified Payload:");
    console.log("- Timestamp:", verifiedToken.timestamp);
    console.log("- Partner ID:", verifiedToken.partnerId);
    console.log("- Request ID:", verifiedToken.reqid);
    console.log("- User ID:", verifiedToken.userId);
    console.log("- Email:", verifiedToken.email);
  } else {
    console.log("❌ Token verification failed");
  }
  console.log("");

  // Test 3: Verify token with wrong secret
  console.log("3. Testing token verification with wrong secret:");
  const wrongSecret = "wrong-secret";
  const verifiedTokenWrong = jwtService.verifyToken(
    tokenResponse.token,
    wrongSecret,
  );

  if (verifiedTokenWrong) {
    console.log("❌ Token verification should have failed but succeeded");
  } else {
    console.log("✅ Token verification correctly failed with wrong secret");
  }
  console.log("");

  // Test 4: Decode token without verification
  console.log("4. Testing token decoding without verification:");
  const decodedToken = jwtService.decodeToken(tokenResponse.token);

  if (decodedToken) {
    console.log("✅ Token decoding successful");
    console.log("Decoded Payload:");
    console.log("- Timestamp:", decodedToken.timestamp);
    console.log("- Partner ID:", decodedToken.partnerId);
    console.log("- Request ID:", decodedToken.reqid);
    console.log("- User ID:", decodedToken.userId);
    console.log("- Email:", decodedToken.email);
  } else {
    console.log("❌ Token decoding failed");
  }
  console.log("");

  // Test 5: Generate token with default values
  console.log("5. Testing JWT token generation with default values:");
  const defaultTokenResponse = jwtService.generateToken();

  console.log("Generated Token (Default):", defaultTokenResponse.token);
  console.log("Token Payload (Default):");
  console.log("- Timestamp:", defaultTokenResponse.payload.timestamp);
  console.log("- Partner ID:", defaultTokenResponse.payload.partnerId);
  console.log("- Request ID:", defaultTokenResponse.payload.reqid);
  console.log("- User ID:", defaultTokenResponse.payload.userId);
  console.log("- Email:", defaultTokenResponse.payload.email);
  console.log("");

  // Test 6: Generate refresh token
  console.log("6. Testing refresh token generation:");
  const refreshTokenResponse = jwtService.generateRefreshToken(
    userJwtSecret,
    userPartnerId,
    userId,
  );

  console.log("Generated Refresh Token:", refreshTokenResponse.token);
  console.log("Refresh Token Payload:");
  console.log("- Timestamp:", refreshTokenResponse.payload.timestamp);
  console.log("- Partner ID:", refreshTokenResponse.payload.partnerId);
  console.log("- Request ID:", refreshTokenResponse.payload.reqid);
  console.log("- User ID:", refreshTokenResponse.payload.userId);
  console.log("");

  // Test 7: Generate API token
  console.log("7. Testing API token generation:");
  const apiTokenResponse = jwtService.generateApiToken(
    userJwtSecret,
    userPartnerId,
  );

  console.log("Generated API Token:", apiTokenResponse.token);
  console.log("API Token Payload:");
  console.log("- Timestamp:", apiTokenResponse.payload.timestamp);
  console.log("- Partner ID:", apiTokenResponse.payload.partnerId);
  console.log("- Request ID:", apiTokenResponse.payload.reqid);
  console.log("");

  // Test 8: Check token expiration
  console.log("8. Testing token expiration check:");
  const isExpired = jwtService.isTokenExpired(tokenResponse.token);
  console.log("Is token expired:", isExpired);
  console.log("");

  // Test 9: Test with null values
  console.log("9. Testing token generation with null values:");
  const nullTokenResponse = jwtService.generateToken(
    null,
    null,
    undefined,
    undefined,
  );

  console.log("Generated Token (Null Values):", nullTokenResponse.token);
  console.log("Token Payload (Null Values):");
  console.log("- Timestamp:", nullTokenResponse.payload.timestamp);
  console.log("- Partner ID:", nullTokenResponse.payload.partnerId);
  console.log("- Request ID:", nullTokenResponse.payload.reqid);
  console.log("- User ID:", nullTokenResponse.payload.userId);
  console.log("- Email:", nullTokenResponse.payload.email);
  console.log("");

  // Test 10: Verify null value token with default secret
  console.log("10. Testing null value token verification with default secret:");
  const verifiedNullToken = jwtService.verifyToken(
    nullTokenResponse.token,
    null,
  );

  if (verifiedNullToken) {
    console.log("✅ Null value token verification successful");
    console.log("Verified Payload:");
    console.log("- Timestamp:", verifiedNullToken.timestamp);
    console.log("- Partner ID:", verifiedNullToken.partnerId);
    console.log("- Request ID:", verifiedNullToken.reqid);
    console.log("- User ID:", verifiedNullToken.userId);
    console.log("- Email:", verifiedNullToken.email);
  } else {
    console.log("❌ Null value token verification failed");
  }
  console.log("");

  console.log("=== JWT Service Test Complete ===");
}

// Run the test
testJwtService().catch(console.error);
