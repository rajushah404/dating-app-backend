const express = require('express');
const {
    PRIVACY_POLICY,
    TERMS_OF_SERVICE,
    COMMUNITY_GUIDELINES,
    CHILD_SAFETY_STANDARDS
} = require('../utils/legalConstants');
const { success } = require('../utils/response');

const router = express.Router();

/**
 * @route GET /api/legal/privacy-policy
 * @desc Get the Privacy Policy
 */
router.get('/privacy-policy', (req, res) => {
    success(res, 'Privacy Policy fetched successfully', PRIVACY_POLICY);
});

/**
 * @route GET /api/legal/terms-of-service
 * @desc Get the Terms of Service
 */
router.get('/terms-of-service', (req, res) => {
    success(res, 'Terms of Service fetched successfully', TERMS_OF_SERVICE);
});

/**
 * @route GET /api/legal/community-guidelines
 * @desc Get the Community Guidelines
 */
router.get('/community-guidelines', (req, res) => {
    success(res, 'Community Guidelines fetched successfully', COMMUNITY_GUIDELINES);
});

/**
 * @route GET /api/legal/child-safety-standards
 * @desc Get the Child Safety Standards (CSAE Prevention)
 */
router.get('/child-safety-standards', (req, res) => {
    success(res, 'Child Safety Standards fetched successfully', CHILD_SAFETY_STANDARDS);
});

/**
 * @route GET /api/legal/all
 * @desc Get all legal documents in one call
 */
router.get('/all', (req, res) => {
    success(res, 'All legal documents fetched successfully', {
        privacyPolicy: PRIVACY_POLICY,
        termsOfService: TERMS_OF_SERVICE,
        communityGuidelines: COMMUNITY_GUIDELINES,
        childSafetyStandards: CHILD_SAFETY_STANDARDS
    });
});

module.exports = router;
