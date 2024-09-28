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

describe('Wallet Management', () => {
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

    it('should import a wallet', async () => {
        const res = await request(app)
            .post('/api/wallets/import')
            .set('Cookie', authCookie)
            .send({
                privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                name: 'TestWallet'
            });
        expect(res.statusCode).toEqual(201);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('name', 'TestWallet');
    });

    it('should get user wallets', async () => {
        const res = await request(app)
            .get('/api/wallets')
            .set('Cookie', authCookie);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('should delete a wallet', async () => {
        // First, get the list of wallets
        const getRes = await request(app)
            .get('/api/wallets')
            .set('Cookie', authCookie);

        const walletId = getRes.body[0].id;

        // Then, delete the wallet
        const deleteRes = await request(app)
            .delete(`/api/wallets/${walletId}`)
            .set('Cookie', authCookie);

        expect(deleteRes.statusCode).toEqual(200);
        expect(Array.isArray(deleteRes.body)).toBeTruthy();
        expect(deleteRes.body.find(w => w.id === walletId)).toBeUndefined();
    });
});

describe('Trade Execution', () => {
    let authCookie;
    let walletId;

    beforeAll(async () => {
        // Login
        const loginRes = await request(app)
            .post('/api/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });
        authCookie = loginRes.headers['set-cookie'];

        // Import a wallet
        const walletRes = await request(app)
            .post('/api/wallets/import')
            .set('Cookie', authCookie)
            .send({
                privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                name: 'TradeWallet'
            });
        walletId = walletRes.body[0].id;
    });

    it('should execute a trade', async () => {
        const res = await request(app)
            .post('/api/trade')
            .set('Cookie', authCookie)
            .send({
                walletId: walletId,
                pair: 'ETH/USDT',
                type: 'buy',
                amountOrPercent: '1',
                maxSlippage: 1
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Trade executed successfully');
        expect(res.body).toHaveProperty('tradeId');
    });
});

describe('Transaction History', () => {
    let authCookie;
    let walletId;

    beforeAll(async () => {
        // Login
        const loginRes = await request(app)
            .post('/api/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });
        authCookie = loginRes.headers['set-cookie'];

        // Get wallet ID
        const walletRes = await request(app)
            .get('/api/wallets')
            .set('Cookie', authCookie);
        walletId = walletRes.body[0].id;
    });

    it('should get transaction history', async () => {
        const res = await request(app)
            .get(`/api/transactions?walletId=${walletId}`)
            .set('Cookie', authCookie);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        // You might want to add more specific checks here depending on your transaction structure
    });
});