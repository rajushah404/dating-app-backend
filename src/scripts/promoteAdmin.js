require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const promoteToAdmin = async (identifier) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const query = identifier.includes('@') ? { email: identifier } : { firebaseUid: identifier };
        const user = await User.findOne(query);

        if (!user) {
            console.error('User not found');
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Success! User ${user.email || user.firebaseUid} is now an ADMIN.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

const arg = process.argv[2];
if (!arg) {
    console.log('Usage: node scripts/promoteAdmin.js <email_or_firebaseUid>');
    process.exit(1);
}

promoteToAdmin(arg);
