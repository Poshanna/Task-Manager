const request = require('supertest');
const app = require('../app');

describe('Health Check API', () => {
  it('GET /api/health - should return 200 OK and status UP', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'UP');
    expect(res.body).toHaveProperty('service', 'task-manager-backend');
    expect(res.body).toHaveProperty('timestamp');
  });
});
