const userRepository = require('../repositories/user.repository');
const connectionRepository = require('../repositories/connection.repository');
const { isUserOnline } = require('../utils/socket');
const AppError = require('../utils/AppError');

class DiscoverService {
    async getDiscoveryFeed(currentUserId, cursor, limit = 20, overrides = {}) {
        // 1. Fetch current user to get preferences and location
        const currentUser = await userRepository.findById(currentUserId);
        if (!currentUser) {
            throw new AppError('User not found', 404);
        }

        if (!currentUser.profileCompleted) {
            throw new AppError('Please complete your profile to use Discovery', 400);
        }

        if (!currentUser.location || !currentUser.location.coordinates) {
            throw new AppError('Location is required for Discovery', 400);
        }

        // 2. Build exclusion list (interacted users + self)
        const interactedUserIds = await connectionRepository.findInteractedUserIds(currentUserId);

        console.log(`Discovery for User: ${currentUser.name} (${currentUserId})`);
        console.log('Excluding IDs:', [...interactedUserIds, currentUserId]);

        // 3. Apply age / gender / distance filters (Priority: Overrides > Profile Settings)
        const filters = {
            currentUserId,
            interactedUserIds,
            genderPreference: overrides.gender || currentUser.interestedIn || [],
            ageMin: overrides.ageMin || currentUser.agePreference?.min || 18,
            ageMax: overrides.ageMax || currentUser.agePreference?.max || 50,
            location: currentUser.location,
            maxDistanceKm: overrides.distance || currentUser.maxDistanceKm || 10,
            cursor,
            limit: parseInt(limit)
        };

        console.log('Filters Applied:', JSON.stringify(filters, null, 2));

        const users = await userRepository.findDiscoverableUsers(filters);
        console.log(`Users found: ${users.length}`);

        // 4. Format response and calculate distance if needed
        // Note: Since we used $near, we can't easily get the precise distance in the same query result without aggregation.
        // If the repository uses $near, we calculate distance here or in the repo.
        // To strictly follow the response shape with "distanceKm", let's ensure the data is properly formatted.

        return users.map(user => {
            // Basic distance calculation (approximate) or if we used aggregation, it would be there.
            // For now, I'll add a helper or assume the repo might handle it.
            // Given the requirement for "distanceKm", I will update the repository to use aggregation for better precision and performance.

            const distance = this._calculateDistance(
                currentUser.location.coordinates[1],
                currentUser.location.coordinates[0],
                user.location.coordinates[1],
                user.location.coordinates[0]
            );

            return {
                _id: user._id,
                name: user.name,
                age: user.age,
                bio: user.bio,
                gender: user.gender,
                lookingFor: user.lookingFor,
                lifestyle: user.lifestyle,
                interests: user.interests,
                personality: user.personality,
                isVerified: user.isVerified,
                lastActiveAt: user.lastActiveAt,
                photos: user.photos,
                voicePrompt: user.voicePrompt,
                hometown: user.hometown,
                preferredDateVibe: user.preferredDateVibe,
                slangBadges: user.slangBadges,
                rashi: user.rashi,
                distanceKm: parseFloat(distance.toFixed(1)),
                onlineStatus: isUserOnline(user._id) ? 'ONLINE' : 'OFFLINE'
            };
        });
    }

    _calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = this._deg2rad(lat2 - lat1);
        const dLon = this._deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this._deg2rad(lat1)) * Math.cos(this._deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    _deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
}

module.exports = new DiscoverService();
