const { error } = require('../utils/response');
const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || [];

    // Mongoose Duplicate Key Error (code: 11000)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    // Mongoose ValidationError
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errors = Object.values(err.errors).map((el) => el.message);
    }

    // Handle Firebase Auth Errors specifically if they come here
    if (err.code && err.code.startsWith('auth/')) {
        statusCode = 401;
        message = 'Invalid or expired authentication token';
    }

    // For production, don't leak stack traces
    // if (process.env.NODE_ENV === 'development') {
    //   console.error(err);
    // }

    error(res, message, errors, statusCode);
};

module.exports = errorHandler;
