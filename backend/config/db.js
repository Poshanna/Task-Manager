const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'taskdb',
  user: process.env.DB_USER || 'taskuser',
  password: process.env.DB_PASSWORD || 'taskpassword',
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  if (!isTest) {
    console.error('PostgreSQL Pool Warning:', err.message);
  }
});

// In-Memory Fallback Store for local standalone mode without running PostgreSQL service
const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

const memoryUsers = [
  {
    id: 1,
    name: 'Demo Student',
    email: 'student@devops.edu',
    password: defaultPasswordHash,
    created_at: new Date()
  }
];

const memoryTasks = [
  {
    id: 1,
    title: 'Setup Jenkins Pipeline',
    description: 'Configure Jenkins Declarative Pipeline stages for automated CI/CD',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    title: 'Dockerize Task App',
    description: 'Create multi-stage Dockerfiles and docker-compose.yml configuration',
    status: 'COMPLETED',
    priority: 'HIGH',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    title: 'Write Backend API Unit Tests',
    description: 'Cover auth, task CRUD, and health endpoints using Jest and Supertest',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

let nextUserId = 2;
let nextTaskId = 4;

function executeMemoryQuery(text, params = []) {
  const sql = text.trim();

  // SELECT 1 AS alive (Health check)
  if (sql.includes('SELECT 1 AS alive')) {
    return { rows: [{ alive: 1 }] };
  }

  // Users: Check existing by email
  if (sql.includes('SELECT * FROM users WHERE email = $1')) {
    const email = params[0]?.toLowerCase().trim();
    const user = memoryUsers.find(u => u.email.toLowerCase() === email);
    return { rows: user ? [user] : [] };
  }

  // Users: Get by ID
  if (sql.includes('SELECT id, name, email, created_at FROM users WHERE id = $1')) {
    const userId = parseInt(params[0], 10);
    const user = memoryUsers.find(u => u.id === userId);
    return { rows: user ? [{ id: user.id, name: user.name, email: user.email, created_at: user.created_at }] : [] };
  }

  // Users: Register new user
  if (sql.includes('INSERT INTO users')) {
    const newUser = {
      id: nextUserId++,
      name: params[0],
      email: params[1].toLowerCase().trim(),
      password: params[2],
      created_at: new Date()
    };
    memoryUsers.push(newUser);
    return { rows: [{ id: newUser.id, name: newUser.name, email: newUser.email, created_at: newUser.created_at }] };
  }

  // Dashboard Stats
  if (sql.includes('COUNT(*)::int AS total')) {
    const userId = parseInt(params[0], 10);
    const userTasks = memoryTasks.filter(t => t.user_id === userId);
    return {
      rows: [{
        total: userTasks.length,
        todo: userTasks.filter(t => t.status === 'TODO').length,
        in_progress: userTasks.filter(t => t.status === 'IN_PROGRESS').length,
        completed: userTasks.filter(t => t.status === 'COMPLETED').length,
        high_priority: userTasks.filter(t => t.priority === 'HIGH').length
      }]
    };
  }

  // Tasks: Select List
  if (sql.includes('SELECT * FROM tasks WHERE user_id = $1')) {
    const userId = parseInt(params[0], 10);
    let filtered = memoryTasks.filter(t => t.user_id === userId);

    if (params.length > 1) {
      for (let i = 1; i < params.length; i++) {
        const val = params[i];
        if (val === 'TODO' || val === 'IN_PROGRESS' || val === 'COMPLETED') {
          filtered = filtered.filter(t => t.status === val);
        } else if (val === 'LOW' || val === 'MEDIUM' || val === 'HIGH') {
          filtered = filtered.filter(t => t.priority === val);
        } else if (typeof val === 'string' && val.startsWith('%') && val.endsWith('%')) {
          const searchStr = val.slice(1, -1).toLowerCase();
          filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(searchStr) || 
            (t.description && t.description.toLowerCase().includes(searchStr))
          );
        }
      }
    }
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: filtered };
  }

  // Tasks: Get single task by ID
  if (sql.includes('SELECT * FROM tasks WHERE id = $1 AND user_id = $2')) {
    const taskId = parseInt(params[0], 10);
    const userId = parseInt(params[1], 10);
    const task = memoryTasks.find(t => t.id === taskId && t.user_id === userId);
    return { rows: task ? [task] : [] };
  }

  // Tasks: Insert task
  if (sql.includes('INSERT INTO tasks')) {
    const newTask = {
      id: nextTaskId++,
      title: params[0],
      description: params[1] || '',
      status: params[2] || 'TODO',
      priority: params[3] || 'MEDIUM',
      due_date: params[4] || null,
      user_id: parseInt(params[5], 10),
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryTasks.push(newTask);
    return { rows: [newTask] };
  }

  // Tasks: Full update
  if (sql.includes('UPDATE tasks') && sql.includes('title = $1')) {
    const title = params[0];
    const description = params[1];
    const status = params[2];
    const priority = params[3];
    const due_date = params[4];
    const id = parseInt(params[5], 10);
    const userId = parseInt(params[6], 10);

    const taskIndex = memoryTasks.findIndex(t => t.id === id && t.user_id === userId);
    if (taskIndex !== -1) {
      memoryTasks[taskIndex] = {
        ...memoryTasks[taskIndex],
        title,
        description,
        status,
        priority,
        due_date,
        updated_at: new Date()
      };
      return { rows: [memoryTasks[taskIndex]] };
    }
    return { rows: [] };
  }

  // Tasks: Status patch update
  if (sql.includes('UPDATE tasks') && sql.includes('status = $1')) {
    const status = params[0];
    const id = parseInt(params[1], 10);
    const userId = parseInt(params[2], 10);

    const taskIndex = memoryTasks.findIndex(t => t.id === id && t.user_id === userId);
    if (taskIndex !== -1) {
      memoryTasks[taskIndex].status = status;
      memoryTasks[taskIndex].updated_at = new Date();
      return { rows: [memoryTasks[taskIndex]] };
    }
    return { rows: [] };
  }

  // Tasks: Delete
  if (sql.includes('DELETE FROM tasks WHERE id = $1 AND user_id = $2')) {
    const id = parseInt(params[0], 10);
    const userId = parseInt(params[1], 10);

    const index = memoryTasks.findIndex(t => t.id === id && t.user_id === userId);
    if (index !== -1) {
      const deleted = memoryTasks.splice(index, 1);
      return { rows: [{ id: deleted[0].id }] };
    }
    return { rows: [] };
  }

  return { rows: [] };
}

const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect ECONNREFUSED')) {
      return executeMemoryQuery(text, params);
    }
    throw error;
  }
};

module.exports = {
  query,
  pool
};
