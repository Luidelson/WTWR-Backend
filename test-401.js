const http = require('http');

// Test protected route without token (should return 401)
console.log('Testing protected route without token...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/users/me',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Response: ${data}`);
    if (res.statusCode === 401) {
      console.log('✅ Correctly returned 401 Unauthorized');
    } else {
      console.log(`❌ Expected 401, got ${res.statusCode}`);
    }
  });
});

req.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

req.end();
