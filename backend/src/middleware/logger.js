const logger = require('../utils/logger');

/**
 * Request Logger Middleware
 * 
 * Logs all incoming requests and outgoing responses with timing information.
 * Provides visibility into API usage and performance.
 */

function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // Log incoming request
  logger.info(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  // Capture response finish event
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    const logMessage = `${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms`;
    
    if (logLevel === 'error') {
      logger.error(logMessage, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime,
      });
    } else {
      logger.info(logMessage, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime,
      });
    }
  });

  next();
}

module.exports = requestLogger;
