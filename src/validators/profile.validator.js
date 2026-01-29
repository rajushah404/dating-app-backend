const AppError = require('../utils/AppError');

const validateUpdateProfile = (req, res, next) => {
    const updates = req.body;
    const errors = [];

    const allowedFields = [
        "name", "age", "gender", "sexualOrientation", "interestedIn",
        "lookingFor", "lifestyle", "interests", "personality", "bio",
        "photos", "location", "locationEnabled", "maxDistanceKm", "agePreference", "fcmToken"
    ];

    // Check for invalid fields
    const updateKeys = Object.keys(updates);
    const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        throw new AppError(`Invalid fields: ${invalidFields.join(', ')}`, 400);
    }

    if (updates.age !== undefined) {
        if (typeof updates.age !== 'number' || updates.age < 18 || updates.age > 50) {
            errors.push('Age must be between 18 and 50');
        }
    }

    if (updates.gender !== undefined) {
        if (!["male", "female", "other"].includes(updates.gender)) {
            errors.push('Invalid gender');
        }
    }

    if (updates.bio !== undefined) {
        if (typeof updates.bio !== 'string' || updates.bio.length > 500) {
            errors.push('Bio must be a string with max 500 characters');
        }
    }

    if (updates.interests !== undefined) {
        if (!Array.isArray(updates.interests) || updates.interests.length > 10) {
            errors.push('Interests must be an array with max 10 items');
        }
    }

    if (updates.sexualOrientation !== undefined) {
        if (!Array.isArray(updates.sexualOrientation)) {
            errors.push('Sexual orientation must be an array');
        } else {
            const validOrientations = ["straight", "gay", "lesbian", "bisexual", "asexual", "other"];
            updates.sexualOrientation.forEach(orientation => {
                if (!validOrientations.includes(orientation)) {
                    errors.push(`Invalid sexual orientation: ${orientation}`);
                }
            });
        }
    }

    if (updates.interestedIn !== undefined) {
        if (!Array.isArray(updates.interestedIn) || updates.interestedIn.length < 1) {
            errors.push('Interested in must be an array with at least 1 value');
        } else {
            const validGenders = ["male", "female", "other"];
            updates.interestedIn.forEach(gender => {
                if (!validGenders.includes(gender)) {
                    errors.push(`Invalid interested in value: ${gender}`);
                }
            });
        }
    }

    if (updates.lookingFor !== undefined) {
        const validLookingFor = ["long_term", "short_term", "casual", "friendship", "marriage", "not_sure"];
        if (!validLookingFor.includes(updates.lookingFor)) {
            errors.push('Invalid looking for value');
        }
    }

    if (updates.lifestyle !== undefined) {
        if (typeof updates.lifestyle !== 'object') {
            errors.push('Lifestyle must be an object');
        } else {
            const validSmoking = ["no", "occasionally", "yes"];
            const validDrinking = ["no", "occasionally", "yes"];
            const validWorkout = ["never", "sometimes", "regularly"];

            if (updates.lifestyle.smoking && !validSmoking.includes(updates.lifestyle.smoking)) {
                errors.push('Invalid smoking value');
            }
            if (updates.lifestyle.drinking && !validDrinking.includes(updates.lifestyle.drinking)) {
                errors.push('Invalid drinking value');
            }
            if (updates.lifestyle.workout && !validWorkout.includes(updates.lifestyle.workout)) {
                errors.push('Invalid workout value');
            }
        }
    }

    if (updates.photos !== undefined) {
        if (!Array.isArray(updates.photos) || updates.photos.length < 1 || updates.photos.length > 6) {
            errors.push('Photos must be an array with 1 to 6 items');
        } else {
            let primaryCount = 0;
            updates.photos.forEach(photo => {
                if (typeof photo !== 'object' || !photo.url || typeof photo.isPrimary !== 'boolean') {
                    errors.push('Each photo must have url and isPrimary');
                }
                if (photo.isPrimary) primaryCount++;
            });
            if (primaryCount !== 1) {
                errors.push('Exactly one photo must be primary');
            }
        }
    }

    if (updates.locationEnabled !== undefined) {
        if (typeof updates.locationEnabled !== 'boolean') {
            errors.push('Location enabled must be boolean');
        }
    }

    if (updates.location !== undefined) {
        if (typeof updates.location !== 'object' || updates.location.type !== 'Point' || !Array.isArray(updates.location.coordinates) || updates.location.coordinates.length !== 2) {
            errors.push('Location must be {type: "Point", coordinates: [lng, lat]}');
        }
    }

    if (updates.maxDistanceKm !== undefined) {
        if (typeof updates.maxDistanceKm !== 'number' || updates.maxDistanceKm < 1 || updates.maxDistanceKm > 500) {
            errors.push('Max distance must be between 1 and 500 km');
        }
    }

    if (updates.locationEnabled === true && (!updates.location || !updates.location.coordinates)) {
        errors.push('Location coordinates required when location enabled');
    }

    if (updates.agePreference !== undefined) {
        if (typeof updates.agePreference !== 'object') {
            errors.push('Age preference must be an object');
        } else {
            const { min, max } = updates.agePreference;
            if (typeof min !== 'number' || min < 18 || min > 50) {
                errors.push('Min age preference must be between 18 and 50');
            }
            if (typeof max !== 'number' || max < 18 || max > 50) {
                errors.push('Max age preference must be between 18 and 50');
            }
            if (min > max) {
                errors.push('Min age preference cannot be greater than max age');
            }
        }
    }

    if (errors.length > 0) {
        throw new AppError('Validation Error', 400, errors);
    }

    next();
};

module.exports = {
    validateUpdateProfile,
};

