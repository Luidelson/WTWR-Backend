const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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

async function testAuthFlow() {
  const baseURL = 'localhost';
  const port = 3001;

  console.log('🔐 Testing Authentication Flow...\n');

  // Step 1: Test user signup
  console.log('1️⃣ Testing POST /signup...');
  const signupData = JSON.stringify({
    name: "Test User Auth",
    avatar: "https://example.com/avatar.jpg",
    email: "testauth@example.com", 
    password: "testpassword123"
  });

  try {
    const signupResponse = await makeRequest({
      hostname: baseURL,
      port: port,
      path: '/signup',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(signupData)
      }
    }, signupData);
    
    console.log(`   Status: ${signupResponse.status}`);
    if (signupResponse.status === 201) {
      console.log('   ✅ Signup successful');
    } else {
      console.log(`   ⚠️ Signup status: ${signupResponse.status}`);
      console.log(`   Response: ${signupResponse.data}`);
    }
  } catch (error) {
    console.log(`   ❌ Signup error: ${error.message}`);
  }

  // Step 2: Test user signin
  console.log('\n2️⃣ Testing POST /signin...');
  const signinData = JSON.stringify({
    email: "testauth@example.com",
    password: "testpassword123"
  });

  let token = null;
  try {
    const signinResponse = await makeRequest({
      hostname: baseURL,
      port: port,
      path: '/signin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(signinData)
      }
    }, signinData);
    
    console.log(`   Status: ${signinResponse.status}`);
    
    if (signinResponse.status === 200) {
      const responseData = JSON.parse(signinResponse.data);
      token = responseData.token;
      console.log('   ✅ Signin successful');
      console.log(`   🔑 Token received: ${token ? 'Yes' : 'No'}`);
      if (token) {
        console.log(`   Token preview: ${token.substring(0, 20)}...`);
      }
    } else {
      console.log(`   ❌ Signin failed with status: ${signinResponse.status}`);
      console.log(`   Response: ${signinResponse.data}`);
    }
  } catch (error) {
    console.log(`   ❌ Signin error: ${error.message}`);
  }

  // Step 3: Test protected route with token
  if (token) {
    console.log('\n3️⃣ Testing GET /users/me with token...');
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
      
      console.log(`   Status: ${userResponse.status}`);
      if (userResponse.status === 200) {
        console.log('   ✅ Protected route access successful');
        const userData = JSON.parse(userResponse.data);
        console.log(`   User: ${userData.name} (${userData.email})`);
      } else {
        console.log(`   ❌ Protected route failed with status: ${userResponse.status}`);
        console.log(`   Response: ${userResponse.data}`);
      }
    } catch (error) {
      console.log(`   ❌ Protected route error: ${error.message}`);
    }

    // Step 4: Test protected route with malformed token
    console.log('\n4️⃣ Testing with malformed token...');
    try {
      const badTokenResponse = await makeRequest({
        hostname: baseURL,
        port: port,
        path: '/users/me',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}corrupted`
        }
      });
      
      console.log(`   Status: ${badTokenResponse.status} (should be 401)`);
      if (badTokenResponse.status === 401) {
        console.log('   ✅ Correctly rejected malformed token');
      } else {
        console.log(`   ⚠️ Unexpected status for bad token: ${badTokenResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Bad token test error: ${error.message}`);
    }
  }

  // Step 5: Test protected route without token
  console.log('\n5️⃣ Testing GET /users/me without token...');
  try {
    const noTokenResponse = await makeRequest({
      hostname: baseURL,
      port: port,
      path: '/users/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${noTokenResponse.status} (should be 401)`);
    if (noTokenResponse.status === 401) {
      console.log('   ✅ Correctly rejected request without token');
    } else {
      console.log(`   ⚠️ Unexpected status for no token: ${noTokenResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ No token test error: ${error.message}`);
  }

  console.log('\n🎯 Authentication flow test completed!');
}

testAuthFlow().catch(console.error);
