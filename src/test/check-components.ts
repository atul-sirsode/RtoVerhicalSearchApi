import { swaggerSpec } from "../config/swagger.js";

const spec = swaggerSpec as any;
console.log("Components section:");
console.log(JSON.stringify(spec.components, null, 2));

console.log("\nSecurity schemes:");
console.log(JSON.stringify(spec.components?.securitySchemes, null, 2));
