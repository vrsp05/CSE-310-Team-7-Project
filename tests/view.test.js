import request from 'supertest';
import app from '../app.js'; 

describe('View Files API Tests', () => {
    let authCookie = '';
    let validFileId = '';

    // 1. Setup: Log in and grab a file ID to test with
    beforeAll(async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'vrsppalilo@gmail.com', password: 'eljefe16' }); 
        
        if (loginRes.body.session) {
            authCookie = `supabaseToken=${loginRes.body.session.access_token}`;
        }

        const fetchRes = await request(app).get('/api/storage/files').set('Cookie', authCookie);
        if (fetchRes.body.files && fetchRes.body.files.length > 0) {
            validFileId = fetchRes.body.files[0].id;
        }
    });

    // ---------------------------------------------------------
    // TEST 1: The Ghost Request
    // ---------------------------------------------------------
    it('should block unauthenticated users from generating view links', async () => {
        if (!validFileId) return;

        const response = await request(app)
            .get(`/api/storage/view/${encodeURIComponent(validFileId)}`); 
            // No auth cookie attached!
        
        expect(response.status).toBe(302); // Should bounce to login
    });

    // ---------------------------------------------------------
    // TEST 2: The Missing File
    // ---------------------------------------------------------
    it('should return a 404 error if the file ID does not exist', async () => {
        const fakeId = 'user_123/this_file_is_fake.pdf';
        
        const response = await request(app)
            .get(`/api/storage/view/${encodeURIComponent(fakeId)}`)
            .set('Cookie', authCookie);
            
        expect(response.status).toBe(404);
        expect(response.body.error).toBeDefined();
    });

    // ---------------------------------------------------------
    // TEST 3: The VIP Pass (Success)
    // ---------------------------------------------------------
    it('should return a temporary signed URL for a valid file', async () => {
        if (!validFileId) {
            console.warn("⚠️ Skipping view test: No files found to test with.");
            return;
        }

        const response = await request(app)
            .get(`/api/storage/view/${encodeURIComponent(validFileId)}`)
            .set('Cookie', authCookie);
        
        expect(response.status).toBe(200);
        expect(response.body.signedUrl).toBeDefined();
        // A valid signed URL from Supabase usually includes a token parameter
        expect(response.body.signedUrl).toContain('token='); 
    });
});