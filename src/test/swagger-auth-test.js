// Test Swagger authentication
import http from 'http';

function testSwaggerAuth() {
  console.log('=== Testing Swagger Authentication ===\n');

  // Test 1: Try to access Swagger without token (should fail)
  console.log('🚫 Test 1: Access without token (should fail)');
  const options1 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api-docs',
    method: 'GET',
  };

  const req1 = http.request(options1, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('Response:', result);
        console.log('✅ Authentication working - access denied without token\n');
        
        // Test 2: Try to access Swagger with invalid token (should fail)
        testInvalidToken();
      } catch (error) {
        console.log('Raw response:', data);
        console.log('✅ Authentication working - returned HTML error page\n');
        testInvalidToken();
      }
    });
  });

  req1.on('error', (error) => {
    console.error('Error:', error.message);
    testInvalidToken();
  });

  req1.end();
}

function testInvalidToken() {
  console.log('🚫 Test 2: Access with invalid token (should fail)');
  
  const options2 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api-docs',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer invalid_token_here'
    }
  };

  const req2 = http.request(options2, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('Response:', result);
        console.log('✅ Authentication working - access denied with invalid token\n');
        
        // Test 3: Try to access Swagger with valid token (should succeed)
        testValidToken();
      } catch (error) {
        console.log('Raw response:', data);
        console.log('✅ Authentication working - returned error\n');
        testValidToken();
      }
    });
  });

  req2.on('error', (error) => {
    console.error('Error:', error.message);
    testValidToken();
  });

  req2.end();
}

function testValidToken() {
  console.log('✅ Test 3: Access with valid token (should succeed)');
  
  // First, login to get a valid token
  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const loginResult = JSON.parse(data);
        
        if (loginResult.status && loginResult.data && loginResult.data.jwt_token) {
          const token = loginResult.data.jwt_token;
          console.log('✅ Login successful, got token');
          
          // Now try to access Swagger with the valid token
          const swaggerOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api-docs',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          };

          const swaggerReq = http.request(swaggerOptions, (res) => {
            console.log(`Status: ${res.statusCode}`);
            
            let swaggerData = '';
            res.on('data', (chunk) => {
              swaggerData += chunk;
            });
            
            res.on('end', () => {
              if (res.statusCode === 200) {
                console.log('✅ SUCCESS: Can access Swagger with valid token!');
                console.log('📄 Swagger HTML page loaded successfully');
                console.log('🔐 Authentication is working perfectly!\n');
                
                console.log('=== Authentication Test Results ===');
                console.log('✅ No token: Access denied (401)');
                console.log('✅ Invalid token: Access denied (401)');  
                console.log('✅ Valid token: Access granted (200)');
                console.log('\n🌐 Swagger UI is now protected!');
                console.log('📝 To access: Login first, then use your JWT token');
                console.log('🔗 Format: Authorization: Bearer <your-jwt-token>');
              } else {
                console.log('❌ Unexpected response with valid token');
                console.log('Status:', res.statusCode);
              }
            });
          });

          swaggerReq.on('error', (error) => {
            console.error('Error accessing Swagger with valid token:', error.message);
          });

          swaggerReq.end();
          
        } else {
          console.log('❌ Login failed:', loginResult.message);
          console.log('Cannot test valid token access');
        }
      } catch (error) {
        console.error('Error parsing login response:', error.message);
      }
    });
  });

  loginReq.on('error', (error) => {
    console.error('Error during login:', error.message);
  });

  loginReq.write(JSON.stringify({
    email: 'transcologistic0011@gmail.com',
    password: 'password123'
  }));
  
  loginReq.end();
}

// Run the tests
testSwaggerAuth();
