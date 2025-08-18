const http = require('http');

// Simple test for GET /items
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/items',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Response Body:`, data);
    console.log(`Success: GET /items should return 200, got ${res.statusCode}`);
  });
});

req.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

req.end();
