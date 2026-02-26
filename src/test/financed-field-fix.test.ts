import { RCDetailsService } from "../services/rc-details.service.js";

/**
 * Test financed field conversion fix
 */
async function testFinancedFieldFix() {
  console.log("Testing Financed Field Conversion Fix");
  console.log("=====================================");

  const rcService = new RCDetailsService();

  // Test API response with "false" string for financed field
  const testApiResponse = {
    reference_id: 12345,
    statuscode: 200,
    message: "success",
    status: true,
    data: {
      rc_number: "TEST123",
      financed: "false", // This should now be converted to boolean false
      // Add minimal required fields
      fit_up_to: "2026-02-27",
      registration_date: "2011-05-02",
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
      insurance_company: "Test Insurance",
      insurance_policy_number: "TEST123",
      insurance_upto: "2026-07-04",
      manufacturing_date: "12/2010",
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
      permit_issue_date: "null",
      permit_valid_from: "null",
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
      variant: "",
    },
  };

  try {
    console.log("1. Testing save with financed: 'false'...");

    // This should now save financed as boolean false instead of null
    await rcService.saveRCDetails(testApiResponse);
    console.log("✅ Successfully saved RC details with financed: 'false'");

    console.log("2. Testing retrieval...");
    const retrieved = await rcService.getRCDetails("TEST123");
    if (retrieved) {
      console.log("✅ Successfully retrieved RC details");
      console.log("   Financed field:", retrieved.data.financed);
      console.log("   Type of financed:", typeof retrieved.data.financed);

      // Verify the conversion back to API format
      if (retrieved.data.financed === "0") {
        console.log("✅ Financed field correctly converted back to '0' string");
      } else {
        console.log("❌ Financed field conversion issue");
      }
    } else {
      console.log("❌ Failed to retrieve RC details");
    }

    console.log("\n🎉 Financed field fix test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Test different financed values
console.log("Testing different financed values:");
const testValues = [
  { input: "false", expected: false },
  { input: "true", expected: true },
  { input: "0", expected: false },
  { input: "1", expected: true },
  { input: "", expected: null },
  { input: "other", expected: null },
];

function convertFinanced(value: string | null) {
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;
  return null;
}

testValues.forEach((test) => {
  const result = convertFinanced(test.input);
  const status = result === test.expected;
  console.log(
    `${status ? "✅" : "❌"} "${test.input}" → ${result} (expected: ${test.expected})`,
  );
});

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFinancedFieldFix();
}

export { testFinancedFieldFix };
