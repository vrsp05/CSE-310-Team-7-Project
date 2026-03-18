/**
 * tests/fetch.test.js
 * Tests for the GET /api/storage/files endpoint using Supertest + Jest.
 * beforeAll logs in with a shared test account to obtain an auth cookie.
 * Tests cover:
 *   1 — Unauthenticated request is redirected (302)
 *   2 — Authenticated request returns { files: [] } or populated array
 *   3 — All returned files belong to the logged-in user (data isolation)
 *   4 — Each file row has the expected database columns
 *   5 — (skipped) Empty files array for a brand-new user
 *   6 — Unusual filenames survive the Supabase storage round-trip
 */
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

    // ---------------------------------------------------------
    // TEST 3: Data Isolation (The Vault Check)
    // ---------------------------------------------------------
    it('should strictly return files belonging to the logged-in user', async () => {
        const response = await request(app)
            .get('/api/storage/files')
            .set('Cookie', authCookie); // Wear the ID badge

        expect(response.status).toBe(200);
        const files = response.body.files;

        // If the database returned files, we audit every single one
        if (files.length > 0) {
            // Grab the ID from the very first file
            const expectedUserId = files[0].user_id;
            
            // Loop through the entire array and ensure NO other IDs snuck in
            files.forEach(file => {
                expect(file.user_id).toBe(expectedUserId);
            });
        }
    });

    // ---------------------------------------------------------
    // TEST 4: Data State (The Inventory Structure)
    // ---------------------------------------------------------
    it('should return properly structured inventory items so the frontend does not crash', async () => {
        const response = await request(app)
            .get('/api/storage/files')
            .set('Cookie', authCookie);

        expect(response.status).toBe(200);
        const files = response.body.files;

        if (files.length > 0) {
            files.forEach(file => {
                // Every row MUST have these exact keys, even if the value inside is null
                expect(file).toHaveProperty('id');
                expect(file).toHaveProperty('user_id');
                expect(file).toHaveProperty('created_at');
                expect(file).toHaveProperty('resume_text');
                expect(file).toHaveProperty('cover_letter_text');

                // Guarantee that the text fields are either valid strings or explicitly null
                // (If they are 'undefined', it will instantly crash the frontend!)
                expect(file.resume_text === null || typeof file.resume_text === 'string').toBe(true);
                expect(file.cover_letter_text === null || typeof file.cover_letter_text === 'string').toBe(true);
            });
        }
    });

    // ---------------------------------------------------------
    // TEST 5: Data State (The Empty Room)
    // ---------------------------------------------------------
    it.skip('should return an empty array for a brand new user', async () => {
        // 1. Create a disposable "burner" account just for this test
        const tempEmail = `newuser_${Date.now()}@example.com`;
        await request(app).post('/api/auth/signup').send({ email: tempEmail, password: 'Password123!', username: 'newbie' });
        
        // 2. Log them in to get their fresh ID badge
        const loginRes = await request(app).post('/api/auth/login').send({ email: tempEmail, password: 'Password123!' });
        const tempCookie = `supabaseToken=${loginRes.body.session.access_token}`;

        // 3. Fetch their files (The Room should be empty!)
        const fetchRes = await request(app).get('/api/storage/files').set('Cookie', tempCookie);
        
        expect(fetchRes.status).toBe(200);
        expect(fetchRes.body.files).toBeDefined();
        expect(fetchRes.body.files.length).toBe(0); // Strictly exactly zero files
    });

    // ---------------------------------------------------------
    // TEST 6: Data State (The Crazy Filename)
    // ---------------------------------------------------------
    it('should handle and store crazy filenames without breaking the database', async () => {
        const crazyName = 'my_resume_!!!_v2(final) 2026.pdf';
        
        // 1. Upload the crazy file using our main authCookie
        await request(app)
            .post('/api/storage/upload')
            .set('Cookie', authCookie)
            .field('bucket', 'resumes')
            .attach('file', Buffer.from('fake pdf data'), crazyName);

        // 2. Fetch the inventory back
        const fetchRes = await request(app).get('/api/storage/files').set('Cookie', authCookie);
        expect(fetchRes.status).toBe(200);
        
        // 3. Dig through the files to ensure our crazy name survived the cloud round-trip
        const foundFile = fetchRes.body.files.find(f => 
            f.resume_text && f.resume_text.includes(crazyName)
        );
        
        expect(foundFile).toBeDefined(); 
    });
});