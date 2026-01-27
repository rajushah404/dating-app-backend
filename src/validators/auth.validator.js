const validator = require('validator');
const AppError = require('../utils/AppError');

const validateAuth = (req, res, next) => {
    const { idToken } = req.body;

    if (!idToken || validator.isEmpty(idToken)) {
        throw new AppError('ID token is required', 400);
    }

    next();
};

module.exports = {
    validateAuth,
};

