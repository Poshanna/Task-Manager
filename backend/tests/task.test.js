const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const db = require('../config/db');

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

const JWT_SECRET = process.env.JWT_SECRET || 'devops_assignment_jwt_secret_key_2026';

describe('Tasks API Endpoints', () => {
  let token;

  beforeAll(() => {
    token = jwt.sign({ id: 1, email: 'john@example.com' }, JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/tasks - should return 401 without auth token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toEqual(401);
  });

  it('GET /api/tasks - should return user tasks with valid token', async () => {
    const mockTasks = [
      { id: 1, title: 'Test Task', status: 'TODO', priority: 'HIGH', user_id: 1 }
    ];
    db.query.mockResolvedValueOnce({ rows: mockTasks });

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toEqual(1);
    expect(res.body[0].title).toEqual('Test Task');
  });

  it('POST /api/tasks - should create a new task', async () => {
    const newTask = {
      id: 2,
      title: 'New Dev Task',
      description: 'DevOps Testing',
      status: 'TODO',
      priority: 'MEDIUM',
      user_id: 1
    };
    db.query.mockResolvedValueOnce({ rows: [newTask] });

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Dev Task',
        description: 'DevOps Testing',
        status: 'TODO',
        priority: 'MEDIUM'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toEqual('New Dev Task');
  });

  it('DELETE /api/tasks/:id - should delete a task', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 2 }] });

    const res = await request(app)
      .delete('/api/tasks/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });
});
