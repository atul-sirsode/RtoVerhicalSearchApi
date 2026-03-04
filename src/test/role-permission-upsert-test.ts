// Test script for Role Permission Upsert API
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/role-permissions";

async function testRolePermissionUpsert() {
  console.log("🧪 Testing Role Permission Upsert API...\n");

  try {
    // Test 1: Update non-existent record (should create)
    console.log("1️⃣ Testing upsert - Create new record...");
    const createResponse = await axios.put(`${BASE_URL}/update`, {
      role_id: 999,
      permission_id: 888,
      is_allowed: 1
    });
    console.log("✅ Create Response:", JSON.stringify(createResponse.data, null, 2));
    console.log("📊 Status Code:", createResponse.status);

    // Test 2: Update existing record (should update)
    console.log("\n2️⃣ Testing upsert - Update existing record...");
    const updateResponse = await axios.put(`${BASE_URL}/update`, {
      role_id: 999,
      permission_id: 888,
      is_allowed: 0
    });
    console.log("✅ Update Response:", JSON.stringify(updateResponse.data, null, 2));
    console.log("📊 Status Code:", updateResponse.status);

    // Test 3: Update with different permission_id (should create new record)
    console.log("\n3️⃣ Testing upsert - Create another record...");
    const create2Response = await axios.put(`${BASE_URL}/update`, {
      role_id: 999,
      permission_id: 777,
      is_allowed: 1
    });
    console.log("✅ Create 2 Response:", JSON.stringify(create2Response.data, null, 2));
    console.log("📊 Status Code:", create2Response.status);

    // Test 4: Verify all records exist
    console.log("\n4️⃣ Verifying all records...");
    const getAllResponse = await axios.get(`${BASE_URL}/`);
    console.log("✅ All Records:", JSON.stringify(getAllResponse.data, null, 2));

    // Test 5: Test error case - missing is_allowed
    console.log("\n5️⃣ Testing error case - missing is_allowed...");
    try {
      await axios.put(`${BASE_URL}/update`, {
        role_id: 999,
        permission_id: 666
      });
    } catch (error: any) {
      console.log("✅ Expected Error:", error.response?.data);
      console.log("📊 Status Code:", error.response?.status);
    }

    console.log("\n🎉 All upsert tests completed successfully!");

  } catch (error: any) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run tests if server is running
testRolePermissionUpsert();
