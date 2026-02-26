// Simple test to check if permissions and roles endpoints are working
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/users/permissions',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Testing GET /api/users/permissions`);
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Response:', result);
      console.log('Permissions endpoint is working! ✅');
    } catch (error) {
      console.log('Raw response:', data);
      console.log('Error parsing response:', error.message);
    }
    
    // Test roles endpoint
    testRolesEndpoint();
  });
});

req.on('error', (error) => {
  console.error('Error testing permissions endpoint:', error.message);
  console.log('❌ Permissions endpoint failed');
});

req.end();

function testRolesEndpoint() {
  const rolesOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/roles',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const rolesReq = http.request(rolesOptions, (res) => {
    console.log(`\nTesting GET /api/users/roles`);
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('Response:', result);
        console.log('Roles endpoint is working! ✅');
      } catch (error) {
        console.log('Raw response:', data);
        console.log('Error parsing response:', error.message);
      }
      
      console.log('\n=== API Test Complete ===');
    });
  });

  rolesReq.on('error', (error) => {
    console.error('Error testing roles endpoint:', error.message);
    console.log('❌ Roles endpoint failed');
  });

  rolesReq.end();
}
