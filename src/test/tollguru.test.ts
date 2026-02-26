import { TollGuruService } from "../services/tollguru.service.js";

async function testTollGuruService() {
  console.log("Testing TollGuru Service...");

  const service = new TollGuruService();

  try {
    // Test 1: Get toll information between Nagpur and Pune
    console.log("\n1. Testing getTollInfo (Nagpur to Pune):");
    const tollRequest = {
      from: {
        address: "Nagpur, maharashtra",
      },
      to: {
        address: "Pune, maharashtra",
      },
      vehicle: {
        type: "2AxlesAuto",
      },
      country: "IND",
    };

    const result1 = await service.getTollInfo(tollRequest);
    console.log("Status:", result1.status);
    console.log("Message:", result1.message);
    if (result1.data) {
      console.log("Routes found:", result1.data.routes.length);
      console.log("Currency:", result1.data.summary.currency);
      console.log("Vehicle type:", result1.data.summary.vehicleType);

      if (result1.data.routes.length > 0) {
        const route = result1.data.routes[0];
        if (route) {
          console.log("Route summary:", route.summary.name);
          console.log("Distance:", route.summary.distance.text);
          console.log("Duration:", route.summary.duration.text);
          console.log("Has tolls:", route.summary.hasTolls);
          console.log(
            "Toll costs - Tag:",
            route.costs.tag,
            "Cash:",
            route.costs.cash,
          );
          console.log("Fuel cost:", route.costs.fuel);
        }
      }
    }

    // Test 2: Test validation - missing from address
    console.log("\n2. Testing validation (missing from address):");
    const invalidRequest1 = {
      from: {
        address: "",
      },
      to: {
        address: "Pune, maharashtra",
      },
      vehicle: {
        type: "2AxlesAuto",
      },
      country: "IND",
    };

    const result2 = await service.getTollInfo(invalidRequest1);
    console.log("Status:", result2.status);
    console.log("Message:", result2.message);
    console.log("Status code:", result2.statuscode);

    // Test 3: Test validation - invalid vehicle type
    console.log("\n3. Testing validation (invalid vehicle type):");
    const invalidRequest2 = {
      from: {
        address: "Nagpur, maharashtra",
      },
      to: {
        address: "Pune, maharashtra",
      },
      vehicle: {
        type: "InvalidVehicle",
      },
      country: "IND",
    };

    const result3 = await service.getTollInfo(invalidRequest2);
    console.log("Status:", result3.status);
    console.log("Message:", result3.message);
    console.log("Status code:", result3.statuscode);

    // Test 4: Get supported vehicle types
    console.log("\n4. Testing getSupportedVehicleTypes():");
    const vehicleTypes = service.getSupportedVehicleTypes();
    console.log("Supported vehicle types:", vehicleTypes);

    // Test 5: Get vehicle description
    console.log("\n5. Testing getVehicleDescription():");
    const description = service.getVehicleDescription("2AxlesAuto");
    console.log("Vehicle description for 2AxlesAuto:", description);

    console.log("\n✅ All TollGuru service tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testTollGuruService();
