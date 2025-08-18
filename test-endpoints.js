const http = require('http');
const https = require('https');

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
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

// Test configuration
const baseURL = 'localhost';
const port = 3001;

async function runTests() {
  console.log('🧪 Starting API Endpoint Tests...\n');

  // Test 1: GET /items (public route)
  console.log('📋 Test 1: GET /items');
  try {
    const response = await makeRequest({
      hostname: baseURL,
      port: port,
      path: '/items',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response: ${response.data.substring(0, 200)}${response.data.length > 200 ? '...' : ''}\n`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 2: POST /signup (public route)
  console.log('📋 Test 2: POST /signup');
  const signupData = JSON.stringify({
    name: "Test User",
    avatar: "https://example.com/avatar.jpg",
    email: "test@example.com",
    password: "testpassword123"
  });

  try {
    const response = await makeRequest({
      hostname: baseURL,
      port: port,
      path: '/signup',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(signupData)
      }
    }, signupData);
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response: ${response.data.substring(0, 200)}${response.data.length > 200 ? '...' : ''}\n`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 3: POST /signin (public route)
  console.log('📋 Test 3: POST /signin');
  const signinData = JSON.stringify({
    email: "test@example.com",
    password: "testpassword123"
  });

  try {
    const response = await makeRequest({
      hostname: baseURL,
      port: port,
      path: '/signin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(signinData)
      }
    }, signinData);
    
    console.log(`✅ Status: ${response.status}`);
    const parsedResponse = JSON.parse(response.data);
    const token = parsedResponse.token;
    console.log(`📄 Response: ${response.data.substring(0, 200)}${response.data.length > 200 ? '...' : ''}\n`);
    
    if (token) {
      // Test 4: GET /users/me (protected route)
      console.log('📋 Test 4: GET /users/me (with token)');
      try {
        const userResponse = await makeRequest({
          hostname: baseURL,
          port: port,
          path: '/users/me',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`✅ Status: ${userResponse.status}`);
        console.log(`📄 Response: ${userResponse.data.substring(0, 200)}${userResponse.data.length > 200 ? '...' : ''}\n`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}\n`);
      }

      // Test 5: POST /items (protected route)
      console.log('📋 Test 5: POST /items (with token)');
      const itemData = JSON.stringify({
        name: "Test Item",
        weather: "cold",
        imageUrl: "https://example.com/item.jpg"
      });

      try {
        const itemResponse = await makeRequest({
          hostname: baseURL,
          port: port,
          path: '/items',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Length': Buffer.byteLength(itemData)
          }
        }, itemData);
        
        console.log(`✅ Status: ${itemResponse.status}`);
        console.log(`📄 Response: ${itemResponse.data.substring(0, 200)}${itemResponse.data.length > 200 ? '...' : ''}\n`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 6: Invalid route (should return 404)
  console.log('📋 Test 6: GET /invalid-route (should return 404)');
  try {
    const response = await makeRequest({
      hostname: baseURL,
      port: port,
      path: '/invalid-route',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response: ${response.data.substring(0, 200)}${response.data.length > 200 ? '...' : ''}\n`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 7: Protected route without token (should return 401)
  console.log('📋 Test 7: GET /users/me (without token - should return 401)');
  try {
    const response = await makeRequest({
      hostname: baseURL,
      port: port,
      path: '/users/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response: ${response.data.substring(0, 200)}${response.data.length > 200 ? '...' : ''}\n`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  console.log('🎉 All tests completed!');
}

runTests().catch(console.error);
