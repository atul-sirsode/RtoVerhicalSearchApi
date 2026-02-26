// Comprehensive test for all new banks and relationship APIs
import http from 'http';

function testAPI(path, method, body = null, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = http.request(options, (res) => {
      console.log(`\n${description}`);
      console.log(`${method} ${path}`);
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Response:', JSON.stringify(result, null, 2));
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

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('=== Testing Banks and Relationship APIs ===\n');

  // Test Banks API
  console.log('🏦 BANKS API TESTS');
  await testAPI('/api/banks', 'GET', null, 'Get all banks');
  
  await testAPI('/api/banks/create', 'POST', {
    id: 'TEST_BANK_001',
    name: 'Test Bank API',
    enabled: 1
  }, 'Create bank');
  
  await testAPI('/api/banks/update', 'PUT', {
    id: 'TEST_BANK_001',
    name: 'Test Bank API Updated',
    enabled: 1
  }, 'Update bank');
  
  await testAPI('/api/banks', 'GET', null, 'Get all banks after update');

  // Test User Permissions API
  console.log('\n👥 USER PERMISSIONS API TESTS');
  await testAPI('/api/user-permissions', 'GET', null, 'Get all user permissions');
  
  await testAPI('/api/user-permissions/create', 'POST', {
    user_id: 1,
    permission_id: 1,
    is_allowed: 1,
    note: 'Test user permission'
  }, 'Create user permission');
  
  await testAPI('/api/user-permissions/update', 'PUT', {
    user_id: 1,
    permission_id: 1,
    is_allowed: 0,
    note: 'Updated test user permission'
  }, 'Update user permission');
  
  await testAPI('/api/user-permissions', 'GET', null, 'Get all user permissions after update');

  // Test Role Permissions API
  console.log('\n🔐 ROLE PERMISSIONS API TESTS');
  await testAPI('/api/role-permissions', 'GET', null, 'Get all role permissions');
  
  await testAPI('/api/role-permissions/create', 'POST', {
    role_id: 1,
    permission_id: 2,
    is_allowed: 1
  }, 'Create role permission');
  
  await testAPI('/api/role-permissions/update', 'PUT', {
    role_id: 1,
    permission_id: 2,
    is_allowed: 0
  }, 'Update role permission');
  
  await testAPI('/api/role-permissions', 'GET', null, 'Get all role permissions after update');

  // Test User Roles API
  console.log('\n👤 USER ROLES API TESTS');
  await testAPI('/api/user-roles', 'GET', null, 'Get all user roles');
  
  await testAPI('/api/user-roles/create', 'POST', {
    user_id: 1,
    role_id: 2,
    assigned_by: 1
  }, 'Create user role');
  
  await testAPI('/api/user-roles', 'GET', null, 'Get all user roles after creation');

  // Test User Security Flags API
  console.log('\n🛡️ USER SECURITY FLAGS API TESTS');
  await testAPI('/api/user-security-flags', 'GET', null, 'Get all user security flags');
  
  await testAPI('/api/user-security-flags/create', 'POST', {
    user_id: 1,
    is_admin: 0,
    bypass_otp: 0,
    mfa_enrolled: 1
  }, 'Create user security flag');
  
  await testAPI('/api/user-security-flags/update', 'PUT', {
    user_id: 1,
    is_admin: 1,
    bypass_otp: 1,
    mfa_enrolled: 1
  }, 'Update user security flag');
  
  await testAPI('/api/user-security-flags', 'GET', null, 'Get all user security flags after update');

  // Cleanup tests
  console.log('\n🧹 CLEANUP TESTS');
  await testAPI('/api/user-security-flags/delete', 'DELETE', {
    user_id: 1
  }, 'Delete user security flag');
  
  await testAPI('/api/user-roles/delete', 'DELETE', {
    user_id: 1,
    role_id: 2
  }, 'Delete user role');
  
  await testAPI('/api/role-permissions/delete', 'DELETE', {
    role_id: 1,
    permission_id: 2
  }, 'Delete role permission');
  
  await testAPI('/api/user-permissions/delete', 'DELETE', {
    user_id: 1,
    permission_id: 1
  }, 'Delete user permission');
  
  await testAPI('/api/banks/delete', 'DELETE', {
    id: 'TEST_BANK_001'
  }, 'Delete bank');

  console.log('\n=== API Testing Complete ===');
}

// Run the tests
runAllTests().catch(console.error);
