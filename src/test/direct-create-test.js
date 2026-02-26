// Test create endpoints for direct permissions and roles APIs
import http from 'http';

function testCreateDirectPermission() {
  const testData = JSON.stringify({
    perm_key: 'menu.test_direct_endpoint',
    perm_name: 'Test Direct Endpoint',
    category: 'Menu',
    description: 'Test permission for direct API endpoint'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/permissions/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Testing POST /api/permissions/create (Direct)`);
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
          console.log('Direct create permission endpoint is working! ✅');
          testCreateDirectRole();
        } else {
          console.log('Direct create permission failed:', result.message);
        }
      } catch (error) {
        console.log('Raw response:', data);
        console.log('Error parsing response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error testing direct create permission endpoint:', error.message);
    console.log('❌ Direct create permission endpoint failed');
  });

  req.write(testData);
  req.end();
}

function testCreateDirectRole() {
  const testData = JSON.stringify({
    role_key: 'test_direct_role',
    role_name: 'Test Direct Role',
    is_system_role: 0
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/roles/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\nTesting POST /api/roles/create (Direct)`);
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
          console.log('Direct create role endpoint is working! ✅');
        } else {
          console.log('Direct create role failed:', result.message);
        }
      } catch (error) {
        console.log('Raw response:', data);
        console.log('Error parsing response:', error.message);
      }
      
      console.log('\n=== Direct Create API Test Complete ===');
    });
  });

  req.on('error', (error) => {
    console.error('Error testing direct create role endpoint:', error.message);
    console.log('❌ Direct create role endpoint failed');
  });

  req.write(testData);
  req.end();
}

// Start testing
console.log('=== Testing Direct Create Endpoints ===');
testCreateDirectPermission();
