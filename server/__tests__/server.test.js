const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
let server;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    server = app.listen(0); // Use a random available port
});

afterAll(async () => {
    await mongoose.connection.close();
    await server.close();
});

describe('Authentication', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should login a user', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Logged in successfully');
    });
});

describe('Bot Management', () => {
    let authCookie;

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });
        authCookie = res.headers['set-cookie'];
    });

    it('should create a new bot', async () => {
        const res = await request(app)
            .post('/api/bots')
            .set('Cookie', authCookie)
            .send({
                name: 'TestBot',
                config: {}
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('name', 'TestBot');
    });

    it('should get user bots', async () => {
        const res = await request(app)
            .get('/api/bots')
            .set('Cookie', authCookie);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });
});