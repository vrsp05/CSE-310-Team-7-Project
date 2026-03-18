import request from 'supertest';
import app from '../app.js'; 

describe('Delete Files API Tests', () => {
    let authCookie = '';
    let fileIdToDelete = '';

    // 1. Setup: Log in and find a file we can test deleting
    beforeAll(async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'vrsppalilo@gmail.com', password: 'eljefe16' }); 
        
        if (loginRes.body.session && loginRes.body.session.access_token) {
            authCookie = `supabaseToken=${loginRes.body.session.access_token}`;
        }

        // Fetch the user's current files so we have a valid ID to test with
        const fetchRes = await request(app)
            .get('/api/storage/files')
            .set('Cookie', authCookie);
            
        if (fetchRes.body.files && fetchRes.body.files.length > 0) {
            fileIdToDelete = fetchRes.body.files[0].id;
        }
    });

    // ---------------------------------------------------------
    // TEST 1: The Ghost Request
    // ---------------------------------------------------------
    it('should block unauthenticated users from deleting files', async () => {
        // Skip if the user has no files to test with
        if (!fileIdToDelete) return;

        const response = await request(app)
            .delete(`/api/storage/files/${fileIdToDelete}`); 
            // Notice: No authCookie!
        
        expect(response.status).toBe(302); // Should redirect to login
    });

    // ---------------------------------------------------------
    // TEST 2: The Clean Sweep
    // ---------------------------------------------------------
    it('should successfully delete an owned file', async () => {
        // Skip if the user has no files to test with
        if (!fileIdToDelete) {
            console.warn("⚠️ Skipping delete test: No files found in the database to delete.");
            return;
        }

        const response = await request(app)
            .delete(`/api/storage/files/${fileIdToDelete}`)
            .set('Cookie', authCookie); // Wearing the ID badge
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("File deleted successfully.");
    });
});