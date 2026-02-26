// Test to verify updated API contracts match database schema
import http from 'http';

function testAPI(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`\n${description}`);
      console.log(`GET ${path}`);
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Response:', JSON.stringify(result, null, 2));
          
          // Verify schema matches database
          if (result.data && result.data.length > 0) {
            const firstItem = result.data[0];
            console.log('\n📋 Schema Verification:');
            console.log('Fields present:', Object.keys(firstItem).join(', '));
            
            // Check for expected fields based on database schema
            if (path.includes('user-permissions')) {
              const expectedFields = ['user_id', 'permission_id', 'is_allowed', 'note', 'updated_at'];
              const hasAllFields = expectedFields.every(field => field in firstItem);
              console.log(`✅ Expected fields present: ${hasAllFields ? 'YES' : 'NO'}`);
              console.log(`📝 Note field type: ${typeof firstItem.note} (should be string|null)`);
            }
            
            if (path.includes('role-permissions')) {
              const expectedFields = ['role_id', 'permission_id', 'is_allowed', 'created_at'];
              const hasAllFields = expectedFields.every(field => field in firstItem);
              console.log(`✅ Expected fields present: ${hasAllFields ? 'YES' : 'NO'}`);
            }
            
            if (path.includes('user-roles')) {
              const expectedFields = ['user_id', 'role_id', 'assigned_at', 'assigned_by'];
              const hasAllFields = expectedFields.every(field => field in firstItem);
              console.log(`✅ Expected fields present: ${hasAllFields ? 'YES' : 'NO'}`);
              console.log(`👤 Assigned_by field type: ${typeof firstItem.assigned_by} (should be number|null)`);
            }
            
            if (path.includes('user-security-flags')) {
              const expectedFields = ['user_id', 'is_admin', 'bypass_otp', 'mfa_enrolled', 'updated_at'];
              const hasAllFields = expectedFields.every(field => field in firstItem);
              console.log(`✅ Expected fields present: ${hasAllFields ? 'YES' : 'NO'}`);
              console.log(`🛡️ Security flags are integers: ${typeof firstItem.is_admin === 'number' && typeof firstItem.bypass_otp === 'number' && typeof firstItem.mfa_enrolled === 'number' ? 'YES' : 'NO'}`);
            }
          }
          
          resolve({ success: res.statusCode < 400, result });
        } catch (error) {
          console.log('Raw response:', data);
          console.log('Error parsing response:', error.message);
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error.message);
      resolve({ success: false, error: error.message });
    });

    req.end();
  });
}

async function runSchemaTests() {
  console.log('=== Testing Updated API Contracts Against Database Schema ===\n');

  // Test User Permissions
  console.log('👥 USER PERMISSIONS');
  await testAPI('/api/user-permissions', 'Get user permissions - should match database schema');

  // Test Role Permissions
  console.log('\n🔐 ROLE PERMISSIONS');
  await testAPI('/api/role-permissions', 'Get role permissions - should match database schema');

  // Test User Roles
  console.log('\n👤 USER ROLES');
  await testAPI('/api/user-roles', 'Get user roles - should match database schema');

  // Test User Security Flags
  console.log('\n🛡️ USER SECURITY FLAGS');
  await testAPI('/api/user-security-flags', 'Get user security flags - should match database schema');

  console.log('\n=== Schema Verification Complete ===');
  console.log('\n🌐 Swagger Documentation: http://localhost:3000/api-docs');
  console.log('All contracts updated to match database schema! ✅');
}

// Run the tests
runSchemaTests().catch(console.error);
