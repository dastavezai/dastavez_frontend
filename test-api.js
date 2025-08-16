// Test API integration
const API_BASE_URL = '/api';

// Test authentication
async function testAuth() {
  console.log('Testing authentication...');
  
  try {
    // Test check email
    const checkEmailResponse = await fetch(`${API_BASE_URL}/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    const checkEmailData = await checkEmailResponse.json();
    console.log('Check email response:', checkEmailData);
    
    // Test login (this will fail with test credentials, but shows the API is working)
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@example.com', 
        password: 'testpassword' 
      })
    });
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
  } catch (error) {
    console.error('Auth test error:', error);
  }
}

// Test chat API (requires authentication)
async function testChat(token) {
  console.log('Testing chat API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Hello, this is a test message' })
    });
    const data = await response.json();
    console.log('Chat response:', data);
  } catch (error) {
    console.error('Chat test error:', error);
  }
}

// Test subscription API
async function testSubscription() {
  console.log('Testing subscription API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscription/price`);
    const data = await response.json();
    console.log('Subscription price response:', data);
  } catch (error) {
    console.error('Subscription test error:', error);
  }
}

// Run tests
async function runTests() {
  console.log('Starting API tests...\n');
  
  await testAuth();
  console.log('\n---\n');
  
  await testSubscription();
  console.log('\n---\n');
  
  // Note: Chat test requires a valid token
  // await testChat('your-token-here');
  
  console.log('Tests completed!');
}

// Run if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
}

export { testAuth, testChat, testSubscription }; 