/**
 * Curated interests and vibes for the modern Nepali dating scene.
 * Focus: Gen Z/Millennial appeal, authentic local culture, and specific hobbies.
 */

// 1. INTERESTS - Categorized for easy selection UI (if needed later), but flat list for now.
const NEPALI_INTERESTS = [
    // 🍔 Foodie Culture
    "Momo Connoisseur", "Chiya Addict", "Laphing Lover", "Newari Bhoj Fan",
    "Thakali Hunter", "Cafe Hopping", "Street Food", "Pizza is Life",
    "Cooking/Baking", "Cocktail Mixing", "Vegetarian", "Vegan",

    // ✈️ Adventure & Outdoors
    "Weekend Hiking", "Ride to Nagarkot", "Mustang Dreamer", "Trekking",
    "Camping", "Paragliding", "Off-roading", "Bungee Jumping",
    "Road Trips", "Solo Traveling",

    // 🎨 Arts & Creativity
    "Photography", "Videography/Reels", "Guitar/Jamming", "Sketching",
    "Writing Poetry", "Stand-up Comedy", "Pottery", "Thrifting",
    "Tattoo/Piercing", "DIY Crafts",

    // 🍿 Entertainment
    "Anime Weeb", "K-Drama Binge", "Netflix & Chill", "Gaming (PUBG/Valo)",
    "Futsal Maniac", "Cricket Crazed", "Techno/Rave", "Live Gigs",
    "Reading/Books", "Podcast Listener", "Horror Movies",

    // 💼 Grind & ambition
    "Startup Life", "Crypto/Stocks", "Medical Student", "Engineer's Pain",
    "Freelancing", "Content Creation", "Lok Sewa Warrior", "Abroad Study Plans",

    // 🧘 Lifestyle
    "Yoga/Meditation", "Gym Rat", "Early Riser", "Night Owl",
    "Plant Parent", "Cat Person", "Dog Person", "Spiritual",
    "Fashion/Styling", "Sneakerhead"
];

// 2. PERSONALITIES - Self-description tags
const NEPALI_PERSONALITIES = [
    "Social Butterfly 🦋", "Introvert (Bhitrey) 🐢", "Ambivert 🌟",
    "Sarcastic 🙃", "Golden Retriever Energy 🐶", "Black Cat Energy 🐈‍⬛",
    "Adventurous (Ghumante) 🏔️", "Chill / Laid back 😌", "Workaholic 💼",
    "Emotional (Bhavuk) 🥺", "Foodie (Khanchuwa) 🥟", "Straightforward 🎯",
    "Hopeless Romantic 🌹", "Logical Thinker 🧠", "Creative Soul 🎨",
    "Fitness Freak 💪", "Party Animal 🕺", "Homebody 🏠",
    "Guffadi (Storyteller) 🗣️", "Good Listener 👂"
];

// 3. VOICE PROMPTS - Conversation starters
const NEPALI_VOICE_PROMPTS = [
    "My controversial Momo opinion is...",
    "Best spot for Chiya in Kathmandu is...",
    "A song that lives in my head rent-free...",
    "If we date, you must accept that I...",
    "My typical Saturday looks like...",
    "The way to my heart is through...",
    "I'm weirdly attracted to...",
    "My biggest 'Nepalese Parent' trauma is...",
    "Pick one: Thamel Saturday night or Bouddha serenity?",
    "My hidden talent (that is useless) is...",
    "A travel destination on my bucket list...",
    "My favorite Nepali slang word is...",
    "Never have I ever...",
    "The best advice I ever got...",
    "I challenge you to a game of...",
    "My go-to comfort food is...",
    "Green flag in a partner for me is...",
    "One thing I can't live without...",
    "If I could trade lives with a Nepali celeb, it would be...",
    "My idea of a perfect first date is..."
];

// 4. LOOKING FOR - Relationship goals
const NEPALI_LOOKING_FOR = [
    "Serious Relationship (Bihe maybe?) 💍",
    "Casual Dating (Let's Vibe) 🥂",
    "New Friends (Chiya Guff) ☕",
    "Travel Buddy (Ghumgham) 🎒",
    "Short-term Fun 🎉",
    "Long-term Partner ❤️",
    "Still Figuring It Out 🤷",
    "Marriage (Direct Kura) 💒"
];

// 5. LIFESTYLE - Smoking
const NEPALI_SMOKING = [
    "Social Smoker",
    "Regular Smoker",
    "Trying to Quit",
    "Non-smoker",
    "Shisha / Hookah Only",
    "420 Friendly 🍃"
];

// 6. LIFESTYLE - Drinking
const NEPALI_DRINKING = [
    "Social Drinker 🍻",
    "Weekend Warrior 🥃",
    "Occasionally 🍷",
    "Teetotaler (No Alcohol) 🚫",
    "Beer Enthusiast 🍺"
];

// 7. LIFESTYLE - Workout
const NEPALI_WORKOUT = [
    "Everyday Gym 💪",
    "Futsal Weekly ⚽",
    "Home Workouts 🧘",
    "Morning Walks 🚶",
    "Occasionally",
    "Never (I choose sleep) 😴"
];

// 8. HOMETOWNS - Major cities/districts
const NEPALI_HOMETOWNS = [
    "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan", "Dharan",
    "Butwal", "Biratnagar", "Birgunj", "Hetauda", "Nepalgunj", "Dhangadhi",
    "Birtamod", "Itahari", "Janakpur", "Palpa", "Gorkha", "Mustang",
    "Manang", "Illam", "Syangja", "Surkhet", "Dang", "Baglung",
    "Kavre", "Dhading", "Nuwakot", "Ramechhap", "Sindhupalchok",
    "Banepa", "Damak", "Lahan", "Tansen", "Bhairahawa", "...."
];

// 9. DATE VIBES - Ideal date ideas
const NEPALI_DATE_VIBES = [
    "Coffee Date ☕",
    "Momo Hunt 🥟",
    "Late Night Drive 🚗",
    "Movie Night 🎬",
    "Hiking / Nature Walk 🌲",
    "Live Music / Gig 🎸",
    "Museum / Art Gallery 🖼️",
    "Street Food Crawl 🍢",
    "Rooftop Dinner 🌃",
    "Picnic at the Park 🧺"
];

// 10. SLANG BADGES - Fun labels
const NEPALI_SLANG_BADGES = [
    "Guffadi", "Bindaas", "Alchi No. 1", "Padhante",
    "Khanchuwa", "Ghumante", "Nakhre", "Sojho",
    "Chatterbox", "Vibe Hai", "Scene Hanne", "Chill Pill",
    "Gym Freak", "Party Animal", "Artist", "Techie"
];

// 11. ZODIAC (RASHI)
const NEPALI_RASHI = [
    "Mesh ♈", "Brish ♉", "Mithun ♊",
    "Karkat ♋", "Simha ♌", "Kanya ♍",
    "Tula ♎", "Brishchik ♏", "Dhanu ♐",
    "Makar ♑", "Kumbha ♒", "Meen ♓"
];

module.exports = {
    NEPALI_INTERESTS,
    NEPALI_PERSONALITIES,
    NEPALI_VOICE_PROMPTS,
    NEPALI_LOOKING_FOR,
    NEPALI_SMOKING,
    NEPALI_DRINKING,
    NEPALI_WORKOUT,
    NEPALI_HOMETOWNS,
    NEPALI_DATE_VIBES,
    NEPALI_SLANG_BADGES,
    NEPALI_RASHI
};
