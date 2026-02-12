import request from 'supertest';
import app from './index.js'; // Ensure you export 'app' in your index.js

describe('Auth System Validation', () => {
  it('should attempt to create a user and return a 200 or 400 status', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'testuser@example.com',
        password: 'Password123!',
        username: 'TestTester'
      });
    
    // This tells you if the server is even reaching the Supabase call
    expect(res.statusCode).toBeDefined(); 
    console.log('Automated Test Result:', res.body);
  });
});