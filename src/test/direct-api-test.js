// Test the new direct API endpoints for permissions and roles
import http from 'http';

function testDirectPermissionsEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/permissions',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Testing GET /api/permissions (Direct)`);
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('Response:', result);
        console.log('Direct permissions endpoint is working! ✅');
      } catch (error) {
        console.log('Raw response:', data);
        console.log('Error parsing response:', error.message);
      }
      
      // Test direct roles endpoint
      testDirectRolesEndpoint();
    });
  });

  req.on('error', (error) => {
    console.error('Error testing direct permissions endpoint:', error.message);
    console.log('❌ Direct permissions endpoint failed');
  });

  req.end();
}

function testDirectRolesEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/roles',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\nTesting GET /api/roles (Direct)`);
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('Response:', result);
        console.log('Direct roles endpoint is working! ✅');
      } catch (error) {
        console.log('Raw response:', data);
        console.log('Error parsing response:', error.message);
      }
      
      console.log('\n=== Direct API Test Complete ===');
    });
  });

  req.on('error', (error) => {
    console.error('Error testing direct roles endpoint:', error.message);
    console.log('❌ Direct roles endpoint failed');
  });

  req.end();
}

// Start testing
console.log('=== Testing Direct API Endpoints ===');
testDirectPermissionsEndpoint();
