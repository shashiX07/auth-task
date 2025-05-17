const logger = require('../utils/logger');

const loggingMiddleware = (req, res, next) => {
  // Log request details
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Track response time
  const start = Date.now();
  
  // Log response after completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = loggingMiddleware;