// Simple test to check if banks API is working
import http from 'http';

function testBanksAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/banks',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Testing GET /api/banks`);
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('Response:', result);
        console.log('Banks API is working! ✅');
      } catch (error) {
        console.log('Raw response:', data);
        console.log('Error parsing response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error testing banks API:', error.message);
    console.log('❌ Banks API failed');
  });

  req.end();
}

// Start testing
console.log('=== Testing Banks API ===');
testBanksAPI();
