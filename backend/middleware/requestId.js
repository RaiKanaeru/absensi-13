const { randomUUID } = require('crypto');

// Attaches a unique request id to each request for correlation in logs
module.exports = function requestId(req, _res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  next();
};
