const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

// Mock DB module
jest.mock('../config/db', () => ({
  query: jest.fn()
}));

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should fail when fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should register user successfully when input is valid', async () => {
      // Mock existing user check -> none
      db.query.mockResolvedValueOnce({ rows: [] });
      // Mock insert user -> user object
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'John Doe', email: 'john@example.com', created_at: new Date() }]
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'john@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should fail when user is not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toMatch(/Invalid credentials/i);
    });
  });
});
