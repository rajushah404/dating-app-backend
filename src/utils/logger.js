const winston = require('winston');
const path = require('path');

// Custom format for logging
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define which logs to record based on environment
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logger = winston.createLogger({
    level: level,
    format: logFormat,
    defaultMeta: { service: 'maya-backend' },
    transports: [
        // Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            maxsize: parseInt(process.env.LOG_MAX_SIZE) || 5242880, // Default 5MB
            maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
        }),
        // Write all logs with importance level of `info` or less to `combined.log`
        new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
            maxsize: parseInt(process.env.LOG_MAX_SIZE) || 5242880, // Default 5MB
            maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
        }),
    ],
});

// If we're not in production then log to the `console` with colors
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
                (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
            )
        ),
    }));
}

module.exports = logger;
