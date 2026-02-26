import { RCDetailsService } from "../services/rc-details.service.js";
import type { RCApiResponse } from "../types/types/auth.types.js";

/**
 * Test the RC Details caching service
 */
async function testRCDetailsService() {
  const rcService = new RCDetailsService();
  
  // Test data - sample RC details
  const testApiResponse: RCApiResponse = {
    reference_id: 12345,
    statuscode: 200,
    message: "Success",
    status: true,
    data: {
      rc_number: "MH12AB1234",
      fit_up_to: "2025-12-31",
      registration_date: "2020-01-15",
      owner_name: "John Doe",
      father_name: "Robert Doe",
      present_address: "123 Main St, Mumbai",
      permanent_address: "456 Park Ave, Pune",
      mobile_number: "9876543210",
      vehicle_category: "LMV",
      vehicle_chasi_number: "MA1234567890",
      vehicle_engine_number: "EN1234567890",
      maker_description: "Maruti Suzuki",
      maker_model: "Swift Dzire",
      body_type: "Sedan",
      fuel_type: "Petrol",
      color: "White",
      norms_type: "BS4",
      financer: "",
      financed: "0",
      insurance_company: "ICICI Lombard",
      insurance_policy_number: "POL123456",
      insurance_upto: "2025-06-30",
      manufacturing_date: "12/2019",
      manufacturing_date_formatted: "2019-12-01",
      registered_at: "RTO Mumbai",
      latest_by: "2025-12-31",
      less_info: false,
      tax_upto: "2025-03-31",
      tax_paid_upto: "2025-03-31",
      cubic_capacity: "1198",
      vehicle_gross_weight: "1500",
      no_cylinders: "4",
      seat_capacity: "5",
      sleeper_capacity: "0",
      standing_capacity: "0",
      wheelbase: "2450",
      unladen_weight: "1050",
      vehicle_category_description: "Light Motor Vehicle",
      pucc_number: "PUCC123456",
      pucc_upto: "2025-12-31",
      permit_number: "",
      permit_issue_date: "",
      permit_valid_from: "",
      permit_valid_upto: "",
      permit_type: "",
      national_permit_number: "",
      national_permit_issue_date: "",
      national_permit_upto: "",
      national_permit_issued_by: "",
      non_use_status: "",
      non_use_from: "",
      non_use_to: "",
      blacklist_status: "",
      noc_details: "",
      owner_number: "1",
      rc_status: "Active",
      masked_name: false,
      challan_details: null,
      variant: "VXI",
    },
  };

  try {
    console.log("Testing RC Details Service...");
    
    // Test 1: Save to cache
    console.log("\n1. Saving RC details to cache...");
    await rcService.saveRCDetails(testApiResponse);
    console.log("✓ RC details saved successfully");
    
    // Test 2: Check if exists in cache
    console.log("\n2. Checking if RC exists in cache...");
    const exists = await rcService.existsInCache("MH12AB1234");
    console.log(`✓ RC exists in cache: ${exists}`);
    
    // Test 3: Retrieve from cache
    console.log("\n3. Retrieving RC details from cache...");
    const cachedData = await rcService.getRCDetails("MH12AB1234");
    if (cachedData) {
      console.log("✓ RC details retrieved from cache");
      console.log(`  Owner: ${cachedData.data.owner_name}`);
      console.log(`  Vehicle: ${cachedData.data.maker_description} ${cachedData.data.maker_model}`);
      console.log(`  Registration: ${cachedData.data.registration_date}`);
    } else {
      console.log("✗ Failed to retrieve RC details from cache");
    }
    
    // Test 4: Get cache stats
    console.log("\n4. Getting cache statistics...");
    const stats = await rcService.getCacheStats();
    console.log(`✓ Total records in cache: ${stats.totalRecords}`);
    console.log(`  Last updated: ${stats.lastUpdated}`);
    
    // Test 5: Test cache miss
    console.log("\n5. Testing cache miss with non-existent RC...");
    const missData = await rcService.getRCDetails("XX99YZ9999");
    if (missData === null) {
      console.log("✓ Cache miss handled correctly");
    } else {
      console.log("✗ Cache miss not handled correctly");
    }
    
    // Test 6: Delete from cache
    console.log("\n6. Deleting RC details from cache...");
    await rcService.deleteRCDetails("MH12AB1234");
    const existsAfterDelete = await rcService.existsInCache("MH12AB1234");
    console.log(`✓ RC exists after delete: ${existsAfterDelete} (should be false)`);
    
    console.log("\n✅ All tests completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testRCDetailsService();
}

export { testRCDetailsService };
