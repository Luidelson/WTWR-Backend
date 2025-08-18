const { STATUS_INTERNAL_SERVER_ERROR } = require("../utils/constants");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);
  
  // If error has a status code, use it, otherwise default to 500
  const statusCode = err.statusCode || STATUS_INTERNAL_SERVER_ERROR;
  
  // If error has a message, use it, otherwise default to generic message
  const message = err.message || "An error occurred on the server";
  
  res.status(statusCode).send({ message });
};

module.exports = errorHandler;
