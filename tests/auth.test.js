/**
 * tests/auth.test.js
 * Authentication edge-case tests using Supertest + Jest.
 * These tests hit the real Supabase Auth API (no mocks) to verify
 * that the /api/auth/signup endpoint correctly rejects bad input:
 *   A — Missing password
 *   B — Invalid email format
 *   C — Weak (too short) password
 */
import request from 'supertest';
import app from '../app.js';

describe('Section 1: Authentication Edge Cases', () => {

    // Edge Case A: Missing Password
    it('should reject signup if password is missing', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'fake@example.com', username: 'hacker' }); 
            // Notice no password is sent
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    // Edge Case B: Invalid Email Format
    it('should reject signup with an invalid email', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'not-an-email', password: 'SecurePassword123!', username: 'tester' });

        expect(response.status).toBe(400);
    });

    // Edge Case C: Weak Password
    it('should reject signup with a 3-character password', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'test_weak_pass@example.com', password: '123', username: 'tester' });

        expect(response.status).toBe(400);
    });
});