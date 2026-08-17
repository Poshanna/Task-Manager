const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'devops_assignment_jwt_secret_key_2026';

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired authentication token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
