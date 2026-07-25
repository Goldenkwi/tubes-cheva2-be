const winston = require('winston');
const chalk = require('chalk');
const env = require('../config/env');

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  const ts = chalk.gray(timestamp);
  const color = {
    error: chalk.red,
    warn: chalk.yellow,
    info: chalk.cyan,
    debug: chalk.magenta,
  }[level] || chalk.white;

  return `${ts} ${color(`[${level.toUpperCase()}]`)} ${message}`;
});

const logger = winston.createLogger({
  level: env.isDev ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json(),
    }),
  ],
});

module.exports = { logger };
