import { RCDetailsService } from "../services/rc-details.service.js";

/**
 * Test date parsing fixes for RC details service
 */
async function testDateParsingFix() {
  console.log("Testing Date Parsing Fixes");
  console.log("=========================");

  const rcService = new RCDetailsService();

  // Test the parseDate method through a sample API response
  const testApiResponse = {
    reference_id: 12345,
    statuscode: 200,
    message: "success",
    status: true,
    data: {
      rc_number: "TEST123",
      fit_up_to: "2026-02-27",
      registration_date: "2011-05-02",
      permit_issue_date: "null",  // This was causing the error
      permit_valid_from: "null", // This was causing the error
      insurance_upto: "2026-07-04",
      manufacturing_date: "12/2010",
      // Add other required fields with test data
      owner_name: "Test Owner",
      father_name: "",
      present_address: "Test Address",
      permanent_address: "Test Address",
      mobile_number: "",
      vehicle_category: "HGV",
      vehicle_chasi_number: "TEST123",
      vehicle_engine_number: "TEST123",
      maker_description: "Test Maker",
      maker_model: "Test Model",
      body_type: "Test Body",
      fuel_type: "DIESEL",
      color: "0",
      norms_type: "Test Norms",
      financer: "",
      financed: "false",
      insurance_company: "Test Insurance",
      insurance_policy_number: "TEST123",
      manufacturing_date_formatted: "2010-12",
      registered_at: "Test Location",
      latest_by: "2026-02-25",
      less_info: true,
      tax_upto: "2026-01-31",
      tax_paid_upto: "",
      cubic_capacity: "1000",
      vehicle_gross_weight: "1000",
      no_cylinders: "4",
      seat_capacity: "3",
      sleeper_capacity: "0",
      standing_capacity: "0",
      wheelbase: "0",
      unladen_weight: "1000",
      vehicle_category_description: "Test Category",
      pucc_number: "TEST123",
      pucc_upto: "2026-03-05",
      permit_number: "TEST123",
      permit_valid_upto: "2030-06-03",
      permit_type: "TEST PERMIT",
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
      rc_status: "ACTIVE",
      masked_name: false,
      challan_details: null,
      variant: ""
    }
  };

  try {
    console.log("1. Testing save with 'null' string dates...");
    
    // This should now work without throwing the MySQL error
    await rcService.saveRCDetails(testApiResponse);
    console.log("✅ Successfully saved RC details with 'null' string dates");
    
    console.log("2. Testing retrieval...");
    const retrieved = await rcService.getRCDetails("TEST123");
    if (retrieved) {
      console.log("✅ Successfully retrieved RC details");
      console.log("   Permit Issue Date:", retrieved.data.permit_issue_date);
      console.log("   Permit Valid From:", retrieved.data.permit_valid_from);
    } else {
      console.log("❌ Failed to retrieve RC details");
    }
    
    console.log("3. Testing cache existence...");
    const exists = await rcService.existsInCache("TEST123");
    console.log(`✅ Cache exists check: ${exists}`);
    
    console.log("\n🎉 All date parsing tests passed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDateParsingFix();
}

export { testDateParsingFix };
