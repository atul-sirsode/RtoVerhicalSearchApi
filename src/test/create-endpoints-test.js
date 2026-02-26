// Test create endpoints for permissions and roles
import http from 'http';

function testCreatePermission() {
  const testData = JSON.stringify({
    perm_key: 'menu.test_api_endpoint',
    perm_name: 'Test API Endpoint',
    category: 'Menu',
    description: 'Test permission for API endpoint validation'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/permissions/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Testing POST /api/users/permissions/create`);
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('Response:', result);
        if (result.status) {
          console.log('Create permission endpoint is working! ✅');
          testCreateRole();
        } else {
          console.log('Create permission failed:', result.message);
        }
      } catch (error) {
        console.log('Raw response:', data);
        console.log('Error parsing response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error testing create permission endpoint:', error.message);
    console.log('❌ Create permission endpoint failed');
  });

  req.write(testData);
  req.end();
}

function testCreateRole() {
  const testData = JSON.stringify({
    role_key: 'test_api_role',
    role_name: 'Test API Role',
    is_system_role: 0
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/roles/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\nTesting POST /api/users/roles/create`);
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('Response:', result);
        if (result.status) {
          console.log('Create role endpoint is working! ✅');
        } else {
          console.log('Create role failed:', result.message);
        }
      } catch (error) {
        console.log('Raw response:', data);
        console.log('Error parsing response:', error.message);
      }
      
      console.log('\n=== Create API Test Complete ===');
    });
  });

  req.on('error', (error) => {
    console.error('Error testing create role endpoint:', error.message);
    console.log('❌ Create role endpoint failed');
  });

  req.write(testData);
  req.end();
}

// Start testing
console.log('=== Testing Create Endpoints ===');
testCreatePermission();
