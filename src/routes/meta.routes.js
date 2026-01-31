const express = require('express');
const {
    NEPALI_INTERESTS,
    NEPALI_PERSONALITIES,
    NEPALI_VOICE_PROMPTS,
    NEPALI_LOOKING_FOR,
    NEPALI_SMOKING,
    NEPALI_DRINKING,
    NEPALI_WORKOUT
} = require('../utils/constants');
const { success } = require('../utils/response');

const router = express.Router();

/**
 * @route GET /api/meta/interests
 * @desc Get list of hyper-local Nepali interests
 */
router.get('/interests', (req, res) => {
    success(res, 'Interests fetched successfully', { interests: NEPALI_INTERESTS });
});

/**
 * @route GET /api/meta/personalities
 * @desc Get list of hyper-local Nepali personalities
 */
router.get('/personalities', (req, res) => {
    success(res, 'Personalities fetched successfully', { personalities: NEPALI_PERSONALITIES });
});

/**
 * @route GET /api/meta/prompts
 * @desc Get list of voice prompts
 */
router.get('/prompts', (req, res) => {
    success(res, 'Prompts fetched successfully', { prompts: NEPALI_VOICE_PROMPTS });
});

/**
 * @route GET /api/meta/looking-for
 * @desc Get list of looking for options
 */
router.get('/looking-for', (req, res) => {
    success(res, 'Looking for options fetched successfully', { options: NEPALI_LOOKING_FOR });
});

/**
 * @route GET /api/meta/lifestyle
 * @desc Get list of lifestyle options (smoking, drinking, workout)
 */
router.get('/lifestyle', (req, res) => {
    success(res, 'Lifestyle options fetched successfully', {
        smoking: NEPALI_SMOKING,
        drinking: NEPALI_DRINKING,
        workout: NEPALI_WORKOUT
    });
});

module.exports = router;
