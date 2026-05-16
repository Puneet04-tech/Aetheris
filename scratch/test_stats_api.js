const fetch = require('node-fetch');

async function testStats() {
  const userId = 'user_2oW0o6962fG8mR2n3P5Q5Q5Q5Q5'; // Replace with a real user ID if known
  const url = 'http://localhost:3001/api/users/stats';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${userId}`
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testStats();
