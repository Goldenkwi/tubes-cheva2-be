const { logger } = require('../utils/logger');
const response = require('../utils/response');

function errorHandler(err, req, res, _next) {
  logger.error(`${err.message} | ${req.method} ${req.originalUrl}`);

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return response.badRequest(res, 'Data already exists');
    }
    if (err.code === 'P2025') {
      return response.notFound(res, 'Record not found');
    }
  }

  if (err.name === 'PrismaClientValidationError') {
    return response.badRequest(res, 'Invalid data format');
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return response.badRequest(res, 'File too large');
    }
    return response.badRequest(res, err.message);
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal Server Error';

  return response.error(res, message, statusCode);
}

module.exports = { errorHandler };
