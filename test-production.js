// Test script to check API endpoints on production
const https = require('https');

async function testProductionAPI() {
  console.log('🌐 Testing Production API Endpoints...\n');

  // Test cases for your production domain
  const tests = [
    {
      name: 'GET /items (public)',
      hostname: 'firstdomain.jumpingcrab.com',
      path: '/items',
      method: 'GET'
    },
    {
      name: 'POST /signin (test request)',
      hostname: 'firstdomain.jumpingcrab.com', 
      path: '/signin',
      method: 'POST',
      data: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    },
    {
      name: 'GET /api/items (if using /api prefix)',
      hostname: 'firstdomain.jumpingcrab.com',
      path: '/api/items', 
      method: 'GET'
    }
  ];

  for (const test of tests) {
    console.log(`📋 Testing: ${test.name}`);
    
    try {
      const result = await makeHTTPSRequest(test);
      console.log(`   Status: ${result.status}`);
      console.log(`   Response: ${result.data.substring(0, 100)}...`);
      
      if (result.status === 404) {
        console.log('   ⚠️  Route not found - likely nginx routing issue');
      } else if (result.status >= 500) {
        console.log('   ❌ Server error');
      } else if (result.status >= 400) {
        console.log('   ⚠️  Client error (expected for test requests)');
      } else {
        console.log('   ✅ Route accessible');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

function makeHTTPSRequest(options) {
  return new Promise((resolve, reject) => {
    const postData = options.data;
    
    const requestOptions = {
      hostname: options.hostname,
      path: options.path,
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0'
      }
    };

    if (postData) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

testProductionAPI().catch(console.error);
