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
            hometown,
            preferredDateVibe,
            slangBadges,
            rashi,
            smoking,
            drinking,
            workout,
            lookingFor,
            interests,
            personality,
            isVerified,
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

        // Apply additional filters if provided
        if (hometown) {
            query.hometown = { $regex: new RegExp(hometown, 'i') };
        }
        if (preferredDateVibe) {
            query.preferredDateVibe = preferredDateVibe;
        }
        if (slangBadges && slangBadges.length > 0) {
            query.slangBadges = { $in: slangBadges };
        }
        if (rashi) {
            query.rashi = rashi;
        }
        if (smoking) {
            query['lifestyle.smoking'] = smoking;
        }
        if (drinking) {
            query['lifestyle.drinking'] = drinking;
        }
        if (workout) {
            query['lifestyle.workout'] = workout;
        }
        if (lookingFor) {
            query.lookingFor = lookingFor;
        }
        if (interests && interests.length > 0) {
            query.interests = { $in: interests };
        }
        if (personality && personality.length > 0) {
            query.personality = { $in: personality };
        }
        if (isVerified) {
            query.isVerified = true;
        }

        // If cursor is provided, filter for IDs greater than the cursor
        // Note: Stable sorting with $near and cursor pagination requires specific strategies,
        // here we implement the requested userId cursor logic.
        if (cursor) {
            query._id.$gt = new mongoose.Types.ObjectId(cursor);
        }

        return await User.find(query)
            .limit(limit)
            .select('name age bio photos voicePrompt location gender lookingFor lifestyle interests personality isVerified lastActiveAt hometown preferredDateVibe slangBadges rashi')
            .lean();
    }
    async findPublicProfileById(id) {
        return await User.findById(id)
            .select('-email -firebaseUid -__v -updatedAt')
            .lean();
    }
}

module.exports = new UserRepository();
