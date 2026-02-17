/**
 * Custom legal documents tailored specifically for MAYA (Premium Dating App).
 * Version: 1.0.0 (Build 1)
 */

const APP_INFO = {
    name: "MAYA (Premium Dating App)",
    version: "1.0.0",
    buildNumber: 1
};

const PRIVACY_POLICY = {
    title: `Privacy Policy for ${APP_INFO.name}`,
    lastUpdated: "February 17, 2026",
    version: APP_INFO.version,
    build: APP_INFO.buildNumber,
    sections: [
        {
            heading: "1. Information We Collect",
            content: `To help you find matches, we collect: Profile details (Name, Age, Gender, Bio), Hyper-local attributes (Hometown, Vedic Rashi, Slang Badges), Lifestyle preferences (Smoking, Drinking, Workout), and Media (Photos and Voice Prompts). We also collect your Email via Firebase Authentication for account security.`
        },
        {
            heading: "2. Precise Location Data",
            content: `${APP_INFO.name} is a location-based discovery app. We collect your GPS coordinates to show you users within your selected distance (e.g., within 10km of Kathmandu). This data is processed in real-time and updated when you use the app.`
        },
        {
            heading: "3. How We Use Your Data",
            content: "Your data is used to: 1. Generate your discovery feed. 2. Calculate distance between users. 3. Power our Rashi and lifestyle matching logic. 4. Manage your daily like limits and subscription status."
        },
        {
            heading: "4. Data Storage & Third Parties",
            content: "We use Firebase for secure authentication and photo/audio storage. Your location and profile data are stored securely in our MongoDB database. We do not sell your personal data to third-party advertisers."
        },
        {
            heading: "5. Safety & Reporting",
            content: "For community safety, we store reports and block lists. If you are reported for harassment, your profile data may be reviewed by our moderation team to ensure a safe environment for all Nepali youths."
        },
        {
            heading: "6. Data Deletion & Retention",
            content: "You have full control over your data. If you choose to delete your account, we permanently remove your profile, photos, voice prompts, match history, and chat messages from our active servers. Some service logs may be retained for security auditing purposes for a limited period, but they will not be linked to your personal identity."
        }
    ]
};

const TERMS_OF_SERVICE = {
    title: `${APP_INFO.name} Terms of Service`,
    lastUpdated: "February 17, 2026",
    version: APP_INFO.version,
    build: APP_INFO.buildNumber,
    sections: [
        {
            heading: "1. Eligibility",
            content: `You must be at least 18 years old to use ${APP_INFO.name}. By creating an account, you represent that you are a legal adult in Nepal or your current place of residence.`
        },
        {
            heading: "2. Account Usage",
            content: "You are responsible for all activity on your account. One person per account. Impersonating others or creating 'fake' profiles using someone else's photos will lead to a permanent ban."
        },
        {
            heading: "3. Daily Limits & Subscriptions",
            content: `Free users are limited to 20 likes per 24-hour period. ${APP_INFO.name} Gold and Platinum subscriptions offer unlimited likes and advanced filters (like Rashi and Slang filters). Subscription fees are non-refundable once the premium features are activated.`
        },
        {
            heading: "4. Prohibited Content",
            content: "You may not upload nudity, hate speech, or content that promotes illegal activities within Nepal. Voice prompts must not contain abusive language or harassment."
        },
        {
            heading: "5. Termination",
            content: `${APP_INFO.name} reserves the right to terminate accounts that violate community safety, receive multiple reports, or attempt to bypass our daily like limits via technical exploits.`
        },
        {
            heading: "6. User-Initiated Account Deletion",
            content: "You may delete your account at any time through the 'Settings' section. Account deletion is permanent and irreversible. Once deleted, your profile, photos, matches, and messages cannot be recovered. Ensure you have saved any important information before proceeding with deletion."
        }
    ]
};

const COMMUNITY_GUIDELINES = {
    title: `${APP_INFO.name} Community Guidelines (The 'Bindaas' Code)`,
    lastUpdated: "February 4, 2026",
    version: APP_INFO.version,
    build: APP_INFO.buildNumber,
    sections: [
        {
            heading: "Be Sojho & Respectful",
            content: "Treat your matches with the same respect you'd give a friend. No 'Risaha' (aggressive) behavior, harassment, or bullying."
        },
        {
            heading: "Authenticity Matters",
            content: "Use your real photos and represent your 'Hometown' and 'Lifestyle' honestly. A 'Sojho' profile is a better profile!"
        },
        {
            heading: "Respect Personal Space",
            content: "If someone doesn't 'Accept' your request, move on. Do not attempt to contact them through other social media platforms without their consent."
        },
        {
            heading: "Celebrate Nepali Culture",
            content: "Whether it's discussing 'Momo places' or sharing your 'Rashi', keep the conversation fun and culturally positive. Let's make dating in Nepal safe and enjoyable."
        },
        {
            heading: "No Spamming",
            content: "Do not use the app for commercial promotions, pyramid schemes, or spamming users with repetitive 'Maya Ho' badges if they aren't interested."
        }
    ]
};

const CHILD_SAFETY_STANDARDS = {
    title: `${APP_INFO.name} Child Safety & CSAE Prevention Standards`,
    lastUpdated: "February 17, 2026",
    version: APP_INFO.version,
    build: APP_INFO.buildNumber,
    contactEmail: "rajushah2286@gmail.com",
    sections: [
        {
            heading: "1. Zero Tolerance Policy",
            content: `${APP_INFO.name} has a zero-tolerance policy regarding Child Sexual Abuse Material (CSAM) and Child Sexual Abuse and Exploitation (CSAE). We prohibit any content that depicts, promotes, or facilitates the sexual exploitation or abuse of children.`
        },
        {
            heading: "2. Age Requirement & Verification",
            content: "Maya is strictly for users aged 18 and above. We use profile verification and manual moderation to ensure all users meet the age requirement. Any account suspected of belonging to a minor will be permanently banned."
        },
        {
            heading: "3. Reporting Mechanism",
            content: "Users are encouraged to report any suspicious behavior, profiles, or content immediately using the in-app 'Report' feature. All reports related to child safety are prioritized and reviewed by our security team within 24 hours."
        },
        {
            heading: "4. Collaboration with Authorities",
            content: "We comply with all relevant child safety laws. We proactively report CSAM/CSAE to the National Center for Missing & Exploited Children (NCMEC) and work closely with Nepali law enforcement to ensure a safe digital environment."
        },
        {
            heading: "5. Prohibited Prohibited Content",
            content: "Strictly prohibited content includes: 1. Imagery of minors in sexual contexts. 2. Content facilitating child grooming or trafficking. 3. Links to external sites containing CSAE. 4. Any attempt to solicit minors."
        }
    ]
};

module.exports = {
    PRIVACY_POLICY,
    TERMS_OF_SERVICE,
    COMMUNITY_GUIDELINES,
    CHILD_SAFETY_STANDARDS
};
