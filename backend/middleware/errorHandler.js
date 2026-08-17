const errorHandler = (err, req, res, next) => {
  console.error('API Error Stack:', err.stack || err.message);
  
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: `Resource not found - ${req.originalUrl}` });
};

module.exports = { errorHandler, notFoundHandler };
