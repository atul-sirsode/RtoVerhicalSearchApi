import { StatesCitiesService } from "../services/states-cities.service.js";

async function testStatesCitiesService() {
  console.log("Testing StatesCitiesService...");

  const service = new StatesCitiesService();

  try {
    // Test getStates
    console.log("\n1. Testing getStates():");
    const states = await service.getStates();
    console.log(`Found ${states.length} states`);
    if (states.length > 0) {
      console.log("Sample states:", states.slice(0, 3));
    }

    // Test getCitiesByState with Maharashtra (IN-MH)
    console.log("\n2. Testing getCitiesByState('IN-MH'):");
    const cities = await service.getCitiesByState("IN-MH");
    console.log(`Found ${cities.length} cities in Maharashtra`);
    if (cities.length > 0) {
      console.log("Sample cities:", cities.slice(0, 5));
    }

    // Test stateExists
    console.log("\n3. Testing stateExists():");
    const mhExists = await service.stateExists("IN-MH");
    console.log("Maharashtra exists:", mhExists);

    const invalidExists = await service.stateExists("XX-YY");
    console.log("Invalid state exists:", invalidExists);

    // Test getStats
    console.log("\n4. Testing getStats():");
    const stats = await service.getStats();
    console.log("Stats:", stats);

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testStatesCitiesService();
