import { StatesCitiesService } from "../services/states-cities.service.js";

async function testInsertCity() {
  console.log("Testing insertCity functionality...");
  
  const service = new StatesCitiesService();
  
  try {
    // Test 1: Insert a new city that doesn't exist
    console.log("\n1. Testing insert new city:");
    const result1 = await service.insertCity({
      city_name: "TestCity123",
      iso_code: "IN-MH"
    });
    console.log("Result:", result1);
    
    // Test 2: Try to insert the same city again (should fail)
    console.log("\n2. Testing duplicate city insertion:");
    const result2 = await service.insertCity({
      city_name: "TestCity123",
      iso_code: "IN-MH"
    });
    console.log("Result:", result2);
    
    // Test 3: Try to insert city for non-existent state
    console.log("\n3. Testing city insertion for non-existent state:");
    const result3 = await service.insertCity({
      city_name: "TestCity456",
      iso_code: "XX-YY"
    });
    console.log("Result:", result3);
    
    // Test 4: Try to insert with missing data
    console.log("\n4. Testing city insertion with missing data:");
    const result4 = await service.insertCity({
      city_name: "",
      iso_code: ""
    });
    console.log("Result:", result4);
    
    // Test 5: Insert another city in a different state
    console.log("\n5. Testing city insertion in different state:");
    const result5 = await service.insertCity({
      city_name: "TestCity789",
      iso_code: "IN-KA"
    });
    console.log("Result:", result5);
    
    // Test 6: Check if the cities were actually added
    console.log("\n6. Verifying cities were added:");
    const mhCities = await service.getCitiesByState("IN-MH");
    const testCityInMH = mhCities.find(city => city.city_name === "TestCity123");
    console.log("TestCity123 found in Maharashtra:", testCityInMH ? "YES" : "NO");
    
    const kaCities = await service.getCitiesByState("IN-KA");
    const testCityInKA = kaCities.find(city => city.city_name === "TestCity789");
    console.log("TestCity789 found in Karnataka:", testCityInKA ? "YES" : "NO");
    
    console.log("\n✅ All insert city tests completed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testInsertCity();
