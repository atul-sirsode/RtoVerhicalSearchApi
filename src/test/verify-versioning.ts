// Simple verification that all functions are properly exported
import { fetchRC, fetchRCV1, fetchRCV2 } from "../controllers/rc.controller.js";

console.log("RC Controller Versioning Verification:");
console.log("=====================================");
console.log("✓ fetchRC (original v1) -", typeof fetchRC);
console.log("✓ fetchRCV1 (explicit v1) -", typeof fetchRCV1);
console.log("✓ fetchRCV2 (with caching) -", typeof fetchRCV2);

console.log("\nAvailable Endpoints:");
console.log("- POST /api/rc/rc_verify (v1 - original, no caching)");
console.log("- POST /api/v1/rc/rc_verify (v1 - explicit, no caching)");
console.log("- POST /api/v2/rc/rc_verify (v2 - with caching)");
