import { StatesCitiesService } from "../services/states-cities.service.js";

async function testDeleteCity() {
  console.log("Testing deleteCity functionality...");
  
  const service = new StatesCitiesService();
  
  try {
    // First, insert a test city to delete
    console.log("\n1. Inserting a test city to delete:");
    const insertResult = await service.insertCity({
      city_name: "CityToDelete123",
      iso_code: "IN-MH"
    });
    console.log("Insert result:", insertResult);
    
    // Test 1: Delete the city we just inserted
    console.log("\n2. Testing delete existing city:");
    const result1 = await service.deleteCity({
      city_name: "CityToDelete123",
      iso_code: "IN-MH"
    });
    console.log("Result:", result1);
    
    // Test 2: Try to delete the same city again (should fail)
    console.log("\n3. Testing delete non-existent city:");
    const result2 = await service.deleteCity({
      city_name: "CityToDelete123",
      iso_code: "IN-MH"
    });
    console.log("Result:", result2);
    
    // Test 3: Try to delete city for non-existent state
    console.log("\n4. Testing city deletion for non-existent state:");
    const result3 = await service.deleteCity({
      city_name: "SomeCity",
      iso_code: "XX-YY"
    });
    console.log("Result:", result3);
    
    // Test 4: Try to delete with missing data
    console.log("\n5. Testing city deletion with missing data:");
    const result4 = await service.deleteCity({
      city_name: "",
      iso_code: ""
    });
    console.log("Result:", result4);
    
    // Test 5: Insert and delete a city in a different state
    console.log("\n6. Testing city deletion in different state:");
    await service.insertCity({
      city_name: "CityToDelete456",
      iso_code: "IN-KA"
    });
    const result5 = await service.deleteCity({
      city_name: "CityToDelete456",
      iso_code: "IN-KA"
    });
    console.log("Result:", result5);
    
    // Test 6: Verify the cities were actually deleted
    console.log("\n7. Verifying cities were deleted:");
    const mhCities = await service.getCitiesByState("IN-MH");
    const deletedCityInMH = mhCities.find(city => city.city_name === "CityToDelete123");
    console.log("CityToDelete123 still in Maharashtra:", deletedCityInMH ? "YES" : "NO");
    
    const kaCities = await service.getCitiesByState("IN-KA");
    const deletedCityInKA = kaCities.find(city => city.city_name === "CityToDelete456");
    console.log("CityToDelete456 still in Karnataka:", deletedCityInKA ? "YES" : "NO");
    
    console.log("\n✅ All delete city tests completed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testDeleteCity();
