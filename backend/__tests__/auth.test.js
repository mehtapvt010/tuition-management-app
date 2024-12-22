const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({
  path: './.env'
});


describe('Auth Tests', () => {
  beforeAll(async () => {
    // connect to test DB or same DB
    try {
        await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
    
        console.log('MongoDB connected');
      }
      catch (error) {
        console.error("MongoDB connection error",error);
        process.exit(1);
      }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('Registers a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'TestUser',
        email: 'test@example.com',
        password: 'test123'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('Prevents duplicate email registration', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'TestUserDup',
        email: 'test@example.com', // same email
        password: 'test123'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('Logs in user with correct credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
  });

  it('Rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });
});