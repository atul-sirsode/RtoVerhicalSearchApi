// Test user CRUD endpoints
import http from 'http';

function testCreateUser() {
  const testData = JSON.stringify({
    username: 'test_api_user_002',
    display_name: 'Test API User 002',
    email: 'testapiuser002@example.com',
    password: 'testPassword456',
    is_active: 1,
    jwt_secret: 'test-api-jwt-secret-002',
    partner_id: 'TEST-API-PARTNER-002'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Testing POST /api/users/create`);
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
          console.log('Create user endpoint is working! ✅');
          testUpdateUser(result.data.user_id);
        } else {
          console.log('Create user failed:', result.message);
        }
      } catch (error) {
        console.log('Raw response:', data);
        console.log('Error parsing response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error testing create user endpoint:', error.message);
    console.log('❌ Create user endpoint failed');
  });

  req.write(testData);
  req.end();
}

function testUpdateUser(userId) {
  const testData = JSON.stringify({
    user_id: userId,
    display_name: 'Test API User 002 - Updated',
    email: 'testapiuser002-updated@example.com'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/update',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\nTesting PUT /api/users/update`);
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
          console.log('Update user endpoint is working! ✅');
          testDeleteUser(userId);
        } else {
          console.log('Update user failed:', result.message);
        }
      } catch (error) {
        console.log('Raw response:', data);
        console.log('Error parsing response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error testing update user endpoint:', error.message);
    console.log('❌ Update user endpoint failed');
  });

  req.write(testData);
  req.end();
}

function testDeleteUser(userId) {
  const testData = JSON.stringify({
    user_id: userId
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/delete',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\nTesting DELETE /api/users/delete`);
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
          console.log('Delete user endpoint is working! ✅');
        } else {
          console.log('Delete user failed:', result.message);
        }
      } catch (error) {
        console.log('Raw response:', data);
        console.log('Error parsing response:', error.message);
      }
      
      console.log('\n=== User CRUD API Test Complete ===');
    });
  });

  req.on('error', (error) => {
    console.error('Error testing delete user endpoint:', error.message);
    console.log('❌ Delete user endpoint failed');
  });

  req.write(testData);
  req.end();
}

// Start testing
console.log('=== Testing User CRUD Endpoints ===');
testCreateUser();
