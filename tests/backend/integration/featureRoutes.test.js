const request = require('supertest');
const app = require('@/../app');

describe('Tag routes', () => {
    it('returns 401 without token', async () => {
        const res = await request(app).get('/api/tags');
        expect(res.status).toBe(401);
    });
});

describe('Streak routes', () => {
    it('returns 401 without token', async () => {
        const res = await request(app).get('/api/streak');
        expect(res.status).toBe(401);
    });
});

describe('Template routes', () => {
    it('returns 401 without token', async () => {
        const res = await request(app).get('/api/templates');
        expect(res.status).toBe(401);
    });
});

describe('AI routes', () => {
    it('returns 401 without token for chat', async () => {
        const res = await request(app).post('/api/ai/chat').send({ message: 'hola' });
        expect(res.status).toBe(401);
    });
});
