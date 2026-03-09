import request from 'supertest';
import app from '../app.js'; 

describe('Section 2: File Upload Edge Cases', () => {
    let authCookie = '';

    // 1. The Setup: Log in before trying to upload
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'vrsppalilo@gmail.com', password: 'eljefe16' }); // Make sure this is your test account!
        
        // FIX: Extract the token from the JSON body, not the headers!
        if (res.body.session && res.body.session.access_token) {
            authCookie = `supabaseToken=${res.body.session.access_token}`;
        } else {
            console.error("Test Login Failed:", res.body);
        }
    });

    // Edge Case D: The Bouncer Test (Unauthenticated)
    it('should completely block uploads if the user is not logged in', async () => {
        const response = await request(app)
            .post('/api/storage/upload')
            .field('bucket', 'resumes'); 
            // Notice we do NOT attach the authCookie here!
        
        // Your requireAuth function redirects (302) unauthenticated users
        expect(response.status).toBe(302);
        expect(response.headers.location).toContain('error=Please+login+first');
    });

    // Edge Case E: Empty Cargo (Logged in, but forgot the file)
    it('should reject the request if no file is attached', async () => {
        const response = await request(app)
            .post('/api/storage/upload')
            .set('Cookie', authCookie) // Now we act like a logged-in user
            .field('bucket', 'resumes'); // But we send no file!
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("No file provided");
    });

    // Edge Case F: Invalid File Type (The Virus Test)
    it('should reject non-PDF/DOCX files', async () => {
        const response = await request(app)
            .post('/api/storage/upload')
            .set('Cookie', authCookie)
            .field('bucket', 'resumes')
            // Supertest lets us simulate uploading a fake malicious file!
            .attach('file', Buffer.from('console.log("hacked!");'), 'virus.js');
        
        // We WANT the server to reject this with a 400 Bad Request
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('type'); 
    });

    // Edge Case G: Bucket Tampering
    it('should reject invalid bucket names', async () => {
        const response = await request(app)
            .post('/api/storage/upload')
            .set('Cookie', authCookie)
            .field('bucket', 'secret-admin-folder') // A bucket that shouldn't exist
            .attach('file', Buffer.from('fake pdf data'), 'resume.pdf');
        
        // The server should reject this before it even talks to Supabase
        expect(response.status).toBe(400); 
    });
});