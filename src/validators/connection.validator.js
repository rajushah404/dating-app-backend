const validator = require('validator');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

const validateSendRequest = (req, res, next) => {
    if (!req.body) {
        throw new AppError('Request body is missing. Make sure you are sending JSON and Content-Type is application/json', 400);
    }
    const { toUserId } = req.params;
    const { status } = req.body;

    const errors = [];

    if (!toUserId || !mongoose.Types.ObjectId.isValid(toUserId)) {
        errors.push('Invalid target user ID');
    }

    if (!status || !['interested', 'ignored'].includes(status)) {
        errors.push('Status must be either "interested" or "ignored"');
    }

    if (errors.length > 0) {
        throw new AppError('Validation Error', 400, errors);
    }

    next();
};

const validateReviewRequest = (req, res, next) => {
    if (!req.body) {
        throw new AppError('Request body is missing. Make sure you are sending JSON and Content-Type is application/json', 400);
    }
    const { requestId } = req.params;
    const { status } = req.body;

    const errors = [];

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
        errors.push('Invalid request ID');
    }

    if (!status || !['accepted', 'rejected'].includes(status)) {
        errors.push('Status must be either "accepted" or "rejected"');
    }

    if (errors.length > 0) {
        throw new AppError('Validation Error', 400, errors);
    }

    next();
};

module.exports = {
    validateSendRequest,
    validateReviewRequest
};

