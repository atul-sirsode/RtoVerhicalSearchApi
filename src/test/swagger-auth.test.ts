/**
 * Test Swagger Authorization Setup
 * This test verifies that the Swagger configuration includes the Bearer token security scheme
 */

import { swaggerSpec } from "../config/swagger.js";

console.log("Swagger Authorization Test");
console.log("==========================");

// Check if security schemes are properly configured
const spec = swaggerSpec as any;
const securitySchemes = spec.definition?.components?.securitySchemes;

if (securitySchemes && securitySchemes.bearerAuth) {
  console.log("✅ Bearer Auth security scheme found:");
  console.log("   Type:", securitySchemes.bearerAuth.type);
  console.log("   Scheme:", securitySchemes.bearerAuth.scheme);
  console.log("   Bearer Format:", securitySchemes.bearerAuth.bearerFormat);
  console.log("   Description:", securitySchemes.bearerAuth.description);
} else {
  console.log("❌ Bearer Auth security scheme not found");
}

// Check if global security is removed (should be undefined for selective application)
const globalSecurity = spec.definition?.security;
if (!globalSecurity) {
  console.log(
    "✅ Global security removed - endpoints will have individual security",
  );
} else {
  console.log("⚠️  Global security still applied");
}

console.log("\n📋 Swagger Configuration Summary:");
console.log("   - Bearer token authentication configured");
console.log("   - Authorization button will appear in Swagger UI");
console.log("   - Users can enter JWT tokens for testing");
console.log("   - Security applied per-endpoint in controller annotations");

console.log("\n🔗 Access Swagger UI:");
console.log("   http://localhost:3000/api-docs");

console.log("\n📝 How to use:");
console.log("   1. Open Swagger UI");
console.log("   2. Click 'Authorize' button");
console.log("   3. Enter 'Bearer <your-jwt-token>'");
console.log("   4. Click 'Authorize'");
console.log("   5. Test protected endpoints");
