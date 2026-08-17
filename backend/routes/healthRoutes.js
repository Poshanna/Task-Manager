const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  let dbStatus = 'UNKNOWN';
  try {
    const result = await db.query('SELECT 1 AS alive');
    if (result.rows[0].alive === 1) {
      dbStatus = 'CONNECTED';
    }
  } catch (error) {
    dbStatus = 'DISCONNECTED';
  }

  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    service: 'task-manager-backend'
  });
});

module.exports = router;
