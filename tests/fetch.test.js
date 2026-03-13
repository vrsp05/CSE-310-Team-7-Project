import request from 'supertest';
import app from '../app.js'; 

describe('Fetch Files API Tests', () => {
    let authCookie = '';

    // 1. The Setup: Log in so we have a valid cookie for our tests
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/auth/login')
            // Update these credentials to your actual test account!
            .send({ email: 'vrsppalilo@gmail.com', password: 'eljefe16' }); 
        
        if (res.body.session && res.body.session.access_token) {
            authCookie = `supabaseToken=${res.body.session.access_token}`;
        }
    });

    // ---------------------------------------------------------
    // TEST 1: The Ghost Request (Unauthenticated)
    // ---------------------------------------------------------
    it('should block unauthenticated users from fetching files', async () => {
        const response = await request(app)
            .get('/api/storage/files'); 
            // Notice we do NOT attach the authCookie here!
        
        // Your requireAuth function should kick them back to the login page
        expect(response.status).toBe(302);
        expect(response.headers.location).toContain('error=Please+login+first');
    });

    // ---------------------------------------------------------
    // TEST 2: The Empty Room / Valid Fetch (Authenticated)
    // ---------------------------------------------------------
    it('should return a JSON object with a files array for logged-in users', async () => {
        const response = await request(app)
            .get('/api/storage/files')
            .set('Cookie', authCookie); // We wear the ID badge here!
        
        expect(response.status).toBe(200);
        
        // We expect the backend to give us an object that has a "files" array
        expect(response.body).toHaveProperty('files');
        expect(Array.isArray(response.body.files)).toBe(true);
    });
});