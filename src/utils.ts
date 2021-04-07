import { Handler } from 'express';
import { createLogger, format, transports } from 'winston';
const { combine, printf } = format;

export const getCode = (size: number = 6) => {
  return Math.random().toString(36).substr(2, size);
};

export const isDevMode = () => {
  return process.env.DEVMODE;
};

export const requestLogger: Handler = async (request, response, next) => {
  logger.info(`Request received at ${request.path}`);
  next();
};

/**
 * Returns YYYY-MM-DD format of date object.
 * @param {Date} date return YYYY-MM-DD format of date object
 */
export const formatDate = (date: Date) => {
  let month = '' + (date.getMonth() + 1);
  let day = '' + date.getDate();
  const year = date.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const loggerFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const loggerOptions = {
  console: {
    handleExceptions: true,
    format: combine(
      format.colorize(),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      loggerFormat
    ),
  },
  file: {
    format: combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      loggerFormat
    ),
  },
};

export const logger = createLogger({
  level: 'info',
  transports: [
    new transports.File({
      filename: `logs/${formatDate(new Date())}-error.log`,
      level: 'error',
      ...loggerOptions.file,
    }),
    new transports.File({
      filename: `logs/${formatDate(new Date())}.log`,
      ...loggerOptions.file,
    }),
    new transports.Console({
      ...loggerOptions.console,
    }),
  ],
});
