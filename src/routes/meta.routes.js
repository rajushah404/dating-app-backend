const express = require('express');
const { NEPALI_INTERESTS } = require('../utils/constants');
const { success } = require('../utils/response');

const router = express.Router();

/**
 * @route GET /api/meta/interests
 * @desc Get list of hyper-local Nepali interests
 */
router.get('/interests', (req, res) => {
    success(res, 'Interests fetched successfully', { interests: NEPALI_INTERESTS });
});

module.exports = router;
