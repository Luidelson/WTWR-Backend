const http = require('http');

const makeRequest = (path, method, data = '', headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body,
          headers: res.headers
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
};

const testDeleteRequests = async () => {
  console.log("=".repeat(70));
  console.log("Testing DELETE Requests - JSON Response Verification");
  console.log("=".repeat(70));

  try {
    // Step 1: Create a user and get JWT token
    console.log("\n1. Creating test user and getting JWT token...");
    const userData = JSON.stringify({
      name: "Test User",
      avatar: "https://example.com/avatar.jpg",
      email: `test${Date.now()}@example.com`,
      password: "password123"
    });

    const signupResponse = await makeRequest('/signup', 'POST', userData);
    
    let token;
    if (signupResponse.status === 201) {
      console.log("✅ User created successfully");
      
      // Login to get JWT token
      const loginData = JSON.stringify({
        email: JSON.parse(userData).email,
        password: "password123"
      });
      
      const loginResponse = await makeRequest('/signin', 'POST', loginData);
      if (loginResponse.status === 200) {
        const loginObj = JSON.parse(loginResponse.body);
        token = loginObj.token;
        console.log("✅ Login successful, got JWT token");
      } else {
        console.log(`❌ Login failed: ${loginResponse.status}`);
        return;
      }
    } else {
      console.log(`❌ Signup failed: ${signupResponse.status}`);
      return;
    }

    // Step 2: Create a clothing item to delete
    console.log("\n2. Creating a clothing item...");
    const itemData = JSON.stringify({
      name: "Test Jacket",
      weather: "cold",
      imageUrl: "https://example.com/jacket.jpg"
    });

    const createResponse = await makeRequest('/items', 'POST', itemData, {
      'Authorization': `Bearer ${token}`
    });

    let itemId;
    if (createResponse.status === 201 || createResponse.status === 200) {
      const createdItem = JSON.parse(createResponse.body);
      itemId = createdItem._id;
      console.log(`✅ Item created with ID: ${itemId}`);
    } else {
      console.log(`❌ Item creation failed: ${createResponse.status} - ${createResponse.body}`);
      return;
    }

    // Step 3: Test DELETE item (successful case)
    console.log("\n3. Testing DELETE /items/:itemId (successful deletion)...");
    const deleteResponse = await makeRequest(`/items/${itemId}`, 'DELETE', '', {
      'Authorization': `Bearer ${token}`
    });

    console.log(`Status: ${deleteResponse.status}`);
    console.log(`Response Body: ${deleteResponse.body}`);

    try {
      const deleteObj = JSON.parse(deleteResponse.body);
      if (deleteResponse.status === 200 && deleteObj.message) {
        console.log("✅ SUCCESS: DELETE returns proper JSON response!");
        console.log(`✅ Status Code: ${deleteResponse.status}`);
        console.log(`✅ JSON Response:`);
        console.log(JSON.stringify(deleteObj, null, 2));
      } else {
        console.log("❌ Unexpected response format for successful deletion");
      }
    } catch (parseError) {
      console.log(`❌ Response is not valid JSON: ${deleteResponse.body}`);
    }

    // Step 4: Test DELETE non-existent item
    console.log("\n4. Testing DELETE /items/:itemId (non-existent item)...");
    const nonExistentId = "507f1f77bcf86cd799439011";
    const deleteNotFoundResponse = await makeRequest(`/items/${nonExistentId}`, 'DELETE', '', {
      'Authorization': `Bearer ${token}`
    });

    console.log(`Status: ${deleteNotFoundResponse.status}`);
    console.log(`Response Body: ${deleteNotFoundResponse.body}`);

    try {
      const errorObj = JSON.parse(deleteNotFoundResponse.body);
      if (deleteNotFoundResponse.status === 404 && errorObj.message === "Item not found") {
        console.log("✅ SUCCESS: DELETE non-existent item returns proper JSON error!");
        console.log(`✅ Status Code: ${deleteNotFoundResponse.status}`);
        console.log(`✅ JSON Response:`);
        console.log(JSON.stringify(errorObj, null, 2));
      } else {
        console.log("❌ Unexpected response for non-existent item deletion");
        console.log(`Expected: 404 with "Item not found"`);
        console.log(`Got: ${JSON.stringify(errorObj, null, 2)}`);
      }
    } catch (parseError) {
      console.log(`❌ Error response is not valid JSON: ${deleteNotFoundResponse.body}`);
    }

    // Step 5: Test DELETE with invalid ID format
    console.log("\n5. Testing DELETE /items/:itemId (invalid ID format)...");
    const invalidId = "invalid-id-123";
    const deleteInvalidResponse = await makeRequest(`/items/${invalidId}`, 'DELETE', '', {
      'Authorization': `Bearer ${token}`
    });

    console.log(`Status: ${deleteInvalidResponse.status}`);
    console.log(`Response Body: ${deleteInvalidResponse.body}`);

    try {
      const errorObj = JSON.parse(deleteInvalidResponse.body);
      if (deleteInvalidResponse.status === 400 && errorObj.message === "Invalid item ID") {
        console.log("✅ SUCCESS: DELETE invalid ID returns proper JSON error!");
        console.log(`✅ Status Code: ${deleteInvalidResponse.status}`);
        console.log(`✅ JSON Response:`);
        console.log(JSON.stringify(errorObj, null, 2));
      } else {
        console.log("❌ Unexpected response for invalid ID deletion");
        console.log(`Expected: 400 with "Invalid item ID"`);
        console.log(`Got: ${JSON.stringify(errorObj, null, 2)}`);
      }
    } catch (parseError) {
      console.log(`❌ Invalid ID error response is not valid JSON: ${deleteInvalidResponse.body}`);
    }

    // Step 6: Test DELETE /items/:itemId/likes (unlike)
    console.log("\n6. Testing DELETE /items/:itemId/likes (unlike)...");
    const unlikeResponse = await makeRequest(`/items/${nonExistentId}/likes`, 'DELETE', '', {
      'Authorization': `Bearer ${token}`
    });

    console.log(`Status: ${unlikeResponse.status}`);
    console.log(`Response Body: ${unlikeResponse.body}`);

    try {
      const unlikeObj = JSON.parse(unlikeResponse.body);
      console.log("✅ Unlike endpoint returns JSON response:");
      console.log(`✅ Status Code: ${unlikeResponse.status}`);
      console.log(`✅ JSON Response:`);
      console.log(JSON.stringify(unlikeObj, null, 2));
    } catch (parseError) {
      console.log(`❌ Unlike response is not valid JSON: ${unlikeResponse.body}`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("DELETE Request Tests Complete!");
    console.log("=".repeat(70));

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
  }
};

// Start the server first, then run tests
console.log("Starting DELETE request tests...");
console.log("Make sure your server is running on port 3001!");
console.log("");

testDeleteRequests();
