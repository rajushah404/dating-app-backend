const mongoose = require('mongoose');
const User = require('../models/User');

class UserRepository {
    async findById(id) {
        return await User.findById(id).lean();
    }

    async findDiscoverableUsers(filters) {
        const {
            currentUserId,
            interactedUserIds,
            genderPreference,
            ageMin,
            ageMax,
            location,
            maxDistanceKm,
            cursor,
            limit = 20
        } = filters;

        // Convert IDs to ObjectIds for correct matching in $nin
        const exclusionList = [...interactedUserIds, currentUserId].map(id => new mongoose.Types.ObjectId(id));

        const query = {
            _id: { $nin: exclusionList },
            profileCompleted: true,
            gender: { $in: genderPreference },
            age: { $gte: ageMin, $lte: ageMax },
            locationEnabled: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: location.coordinates
                    },
                    $maxDistance: maxDistanceKm * 1000 // Convert km to meters
                }
            }
        };

        // If cursor is provided, filter for IDs greater than the cursor
        // Note: Stable sorting with $near and cursor pagination requires specific strategies,
        // here we implement the requested userId cursor logic.
        if (cursor) {
            query._id.$gt = new mongoose.Types.ObjectId(cursor);
        }

        return await User.find(query)
            .limit(limit)
            .select('name age bio photos voicePrompt location')
            .lean();
    }
    async findPublicProfileById(id) {
        return await User.findById(id)
            .select('-email -firebaseUid -__v -updatedAt')
            .lean();
    }
}

module.exports = new UserRepository();
