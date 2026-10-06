const http = require('http');

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: method,
      headers: data ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      } : {}
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log("1. Testing Health Endpoint");
  let res = await request('GET', '/api/health');
  console.log(res);
  
  console.log("\n2. Testing Ticket Creation");
  const t1 = await request('POST', '/api/tickets', {
    customer_name: "Test User", customer_email: "test@test.com", subject: "I was charged twice", description: "I was charged twice for the subscription!"
  });
  console.log(t1);

  const t2 = await request('POST', '/api/tickets', {
    customer_name: "Test User", customer_email: "test@test.com", subject: "API returning 500 error", description: "I am getting a 500 error when hitting the endpoint."
  });

  const t3 = await request('POST', '/api/tickets', {
    customer_name: "Test User", customer_email: "test@test.com", subject: "Cannot login", description: "I forgot my password."
  });

  const t4 = await request('POST', '/api/tickets', {
    customer_name: "Test User", customer_email: "test@test.com", subject: "I was hacked", description: "Someone hacked my account and security is breached."
  });

  console.log("\n3. Testing Ticket Retrieval");
  let t = await request('GET', `/api/tickets/${t1.data.id}`);
  console.log(`Ticket ${t1.data.id} details:`, t.data.subject);

  console.log("\n4. Testing Ticket Processing (Billing)");
  let p1 = await request('POST', `/api/tickets/${t1.data.id}/process`);
  console.log(p1.data);

  console.log("\n5. Testing Ticket Processing (Technical)");
  let p2 = await request('POST', `/api/tickets/${t2.data.id}/process`);
  console.log(p2.data);

  console.log("\n6. Testing Ticket Processing (Account)");
  let p3 = await request('POST', `/api/tickets/${t3.data.id}/process`);
  console.log(p3.data);

  console.log("\n7. Testing Ticket Processing (Security Escalation)");
  let p4 = await request('POST', `/api/tickets/${t4.data.id}/process`);
  console.log(p4.data);

  console.log("\n8. Testing Dashboard Stats");
  let d = await request('GET', '/api/dashboard/stats');
  console.log(d.data);
}

runTests().catch(console.error);
