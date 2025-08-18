// Re-export all error classes from the errors directory
const BadRequestError = require('./errors/BadRequestError');
const UnauthorizedError = require('./errors/UnauthorizedError');
const ForbiddenError = require('./errors/ForbiddenError');
const NotFoundError = require('./errors/NotFoundError');
const ConflictError = require('./errors/ConflictError');
const InternalServerError = require('./errors/InternalServerError');

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
