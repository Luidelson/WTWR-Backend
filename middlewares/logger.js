const expressWinston = require("express-winston");
const winston = require("winston");

const messageFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(
    ({ level, message, meta, timestamp }) =>
      `${timestamp} ${level}: ${meta.error?.stack || message}`
  )
);

const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      format: messageFormat,
    }),
    new winston.transports.File({
      filename: "error.log",
      format: winston.format.json(),
    }),
  ],
});

// The request logger, with two different "transports". One transport
// logs to a file, the other logs to the console.
const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.Console({
      // For console logs we use our relatively concise messageFormat
      format: messageFormat,
    }),
    new winston.transports.File({
      filename: "request.log",
      // For file logs we use the more verbose json format
      format: winston.format.json(),
    }),
  ],
});

module.exports = {
  errorLogger,
  requestLogger,
};
