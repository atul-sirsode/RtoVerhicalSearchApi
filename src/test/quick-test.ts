import { RCDetailsService } from "../services/rc-details.service.js";

async function quickTest() {
  console.log("Starting quick test...");
  
  const service = new RCDetailsService();
  
  try {
    // Test cache stats
    const stats = await service.getCacheStats();
    console.log("Cache stats:", stats);
    
    // Test existence check
    const exists = await service.existsInCache("TEST123");
    console.log("RC exists:", exists);
    
    console.log("✅ Quick test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

quickTest();
