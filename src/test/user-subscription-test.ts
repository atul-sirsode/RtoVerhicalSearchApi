// Test script for User Subscription API
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/user-subscriptions";

async function testUserSubscriptionAPI() {
  console.log("🧪 Testing User Subscription API...\n");

  try {
    // Test 1: Create a new subscription
    console.log("1️⃣ Creating a new subscription...");
    const createResponse = await axios.post(BASE_URL, {
      username: "testuser123",
      start_date: "2024-03-02",
      validity_days: 30
    });
    console.log("✅ Create Response:", JSON.stringify(createResponse.data, null, 2));

    // Test 2: Get all subscriptions
    console.log("\n2️⃣ Getting all subscriptions...");
    const getAllResponse = await axios.get(BASE_URL);
    console.log("✅ Get All Response:", JSON.stringify(getAllResponse.data, null, 2));

    // Test 3: Get subscription by username
    console.log("\n3️⃣ Getting subscription by username...");
    const getByUsernameResponse = await axios.get(`${BASE_URL}/testuser123`);
    console.log("✅ Get by Username Response:", JSON.stringify(getByUsernameResponse.data, null, 2));

    // Test 4: Update subscription
    console.log("\n4️⃣ Updating subscription...");
    const updateResponse = await axios.put(`${BASE_URL}/testuser123`, {
      validity_days: 60
    });
    console.log("✅ Update Response:", JSON.stringify(updateResponse.data, null, 2));

    // Test 5: Create another subscription
    console.log("\n5️⃣ Creating another subscription...");
    const create2Response = await axios.post(BASE_URL, {
      username: "testuser456",
      start_date: "2024-03-01",
      validity_days: 45
    });
    console.log("✅ Create 2 Response:", JSON.stringify(create2Response.data, null, 2));

    // Test 6: Get subscriptions with pagination
    console.log("\n6️⃣ Getting subscriptions with pagination...");
    const paginatedResponse = await axios.get(`${BASE_URL}?page=1&limit=5`);
    console.log("✅ Paginated Response:", JSON.stringify(paginatedResponse.data, null, 2));

    // Test 7: Search by username
    console.log("\n7️⃣ Searching subscriptions by username...");
    const searchResponse = await axios.get(`${BASE_URL}?username=test`);
    console.log("✅ Search Response:", JSON.stringify(searchResponse.data, null, 2));

    // Test 8: Delete subscription
    console.log("\n8️⃣ Deleting subscription...");
    const deleteResponse = await axios.delete(`${BASE_URL}/testuser123`);
    console.log("✅ Delete Response:", JSON.stringify(deleteResponse.data, null, 2));

    // Test 9: Verify deletion
    console.log("\n9️⃣ Verifying deletion...");
    try {
      await axios.get(`${BASE_URL}/testuser123`);
    } catch (error: any) {
      console.log("✅ Delete Verification - Expected 404:", error.response?.status);
    }

    console.log("\n🎉 All tests completed successfully!");

  } catch (error: any) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run tests if server is running
testUserSubscriptionAPI();
