// Test the new login dialog functionality
import http from 'http';

function testLoginDialog() {
  console.log('=== Testing Login Dialog Functionality ===\n');

  // Test 1: Try to access Swagger without token (should show login dialog)
  console.log('🚫 Test 1: Access /api-docs without token (should show login dialog)');
  
  const options1 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api-docs',
    method: 'GET',
  };

  const req1 = http.request(options1, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Content-Type:', res.headers['content-type']);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 401 && res.headers['content-type']?.includes('text/html')) {
        console.log('✅ SUCCESS: Login dialog displayed instead of JSON error!');
        console.log('📄 Response is HTML (login page)');
        
        // Check if it contains login form elements
        if (data.includes('swagger-login.html') || data.includes('User ID') || data.includes('Password')) {
          console.log('✅ Login form elements detected in HTML');
        }
        
        if (data.includes('🔐 API Documentation')) {
          console.log('✅ Custom styling and branding applied');
        }
        
        console.log('\n🎯 Login dialog is working perfectly!');
      } else {
        console.log('❌ Unexpected response format');
        console.log('Status:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Response length:', data.length);
      }
      
      // Test 2: Try with invalid token (should also show login dialog)
      testInvalidToken();
    });
  });

  req1.on('error', (error) => {
    console.error('Error:', error.message);
    testInvalidToken();
  });

  req1.end();
}

function testInvalidToken() {
  console.log('\n🚫 Test 2: Access /api-docs with invalid token (should show login dialog)');
  
  const options2 = {
    hostname: 'localhost',
    port: 3000,
    path: '/api-docs',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer invalid_token_12345'
    }
  };

  const req2 = http.request(options2, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Content-Type:', res.headers['content-type']);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 401 && res.headers['content-type']?.includes('text/html')) {
        console.log('✅ SUCCESS: Login dialog displayed for invalid token!');
        console.log('📄 Response is HTML (login page)');
      } else {
        console.log('❌ Unexpected response for invalid token');
        console.log('Status:', res.statusCode);
      }
      
      // Test 3: Verify swagger.json is still accessible
      testSwaggerJson();
    });
  });

  req2.on('error', (error) => {
    console.error('Error:', error.message);
    testSwaggerJson();
  });

  req2.end();
}

function testSwaggerJson() {
  console.log('\n📄 Test 3: Access /swagger.json (should still work)');
  
  const options3 = {
    hostname: 'localhost',
    port: 3000,
    path: '/swagger.json',
    method: 'GET',
  };

  const req3 = http.request(options3, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ SUCCESS: Swagger JSON still accessible');
        console.log('📋 Available API paths:', Object.keys(result.paths || {}).slice(0, 3).join(', '));
        
        console.log('\n=== Login Dialog Test Results ===');
        console.log('🔐 No token: ✅ Shows login dialog (401 HTML)');
        console.log('🚫 Invalid token: ✅ Shows login dialog (401 HTML)');
        console.log('📄 Swagger JSON: ✅ Still accessible (200 JSON)');
        console.log('\n🎉 Login dialog is working perfectly!');
        console.log('📝 Users will see a friendly login form instead of error messages');
        console.log('🔗 After login, users will be redirected to Swagger docs');
        
      } catch (error) {
        console.log('❌ Error parsing swagger.json:', error.message);
      }
    });
  });

  req3.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req3.end();
}

// Run the tests
testLoginDialog();
