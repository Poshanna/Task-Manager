const express = require('express');
const router = express.Router();
const {
  getTasks,
  getDashboardStats,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All task routes require authentication
router.use(authenticateToken);

router.get('/', getTasks);
router.get('/stats', getDashboardStats);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

module.exports = router;
