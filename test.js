const https = require('https');

const data = JSON.stringify({
  status: 'approved',
  decision_remarks: 'test',
  decided_by: 'USR_AVP_001'
});

const options = {
  hostname: 'dev-int.ismart.org',
  port: 443,
  path: '/api/operations/transfers/3fa85f64-5717-4562-b3fc-2c963f66afa6',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  rejectUnauthorized: false
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', body);
  });
});

req.on('error', error => {
  console.error('Request Error:', error);
});

req.write(data);
req.end();
