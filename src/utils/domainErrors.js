const AppError = require('./AppError');

class BadRequestError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}

class ForbiddenError extends AppError {
    constructor(message) {
        super(message, 403);
    }
}

module.exports = {
    BadRequestError,
    NotFoundError,
    ConflictError,
    ForbiddenError
};
