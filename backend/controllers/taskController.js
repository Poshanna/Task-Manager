const db = require('../config/db');

// Get all tasks for authenticated user (with optional search, status, priority filters)
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, priority, search } = req.query;

    let queryText = 'SELECT * FROM tasks WHERE user_id = $1';
    const queryParams = [userId];
    let paramIndex = 2;

    if (status && status !== 'ALL') {
      queryText += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (priority && priority !== 'ALL') {
      queryText += ` AND priority = $${paramIndex}`;
      queryParams.push(priority);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await db.query(queryText, queryParams);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// Get Dashboard Stats for authenticated user
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const statsResult = await db.query(
      `SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'TODO')::int AS todo,
        COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')::int AS in_progress,
        COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS completed,
        COUNT(*) FILTER (WHERE priority = 'HIGH')::int AS high_priority
       FROM tasks WHERE user_id = $1`,
      [userId]
    );

    res.json(statsResult.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Get single task by ID
const getTaskById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Create new task
const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, status, priority, due_date } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const taskStatus = status || 'TODO';
    const taskPriority = priority || 'MEDIUM';

    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

    if (!validStatuses.includes(taskStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (!validPriorities.includes(taskPriority)) {
      return res.status(400).json({ message: 'Invalid priority value' });
    }

    const result = await db.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title.trim(), description || '', taskStatus, taskPriority, due_date || null, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Update task
const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, status, priority, due_date } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority value' });
    }

    const result = await db.query(
      `UPDATE tasks 
       SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title.trim(), description || '', status || 'TODO', priority || 'MEDIUM', due_date || null, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Update task status specifically
const updateTaskStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Valid status (TODO, IN_PROGRESS, COMPLETED) is required' });
    }

    const result = await db.query(
      `UPDATE tasks 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Delete task
const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.json({ message: 'Task deleted successfully', id: parseInt(id, 10) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getDashboardStats,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
