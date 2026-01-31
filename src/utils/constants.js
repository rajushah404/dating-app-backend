/**
 * Hyper-local interests tailored for Nepali youths.
 */
const NEPALI_INTERESTS = [
    // Food & Drink
    "Momo Lover", "Chiya Guff", "Newari Bhoj", "Thakali Hunter",
    "Laphing Addict", "Pani Puri Queen", "Street Foodie", "BBQ Night",
    "Dhido Lover", "Sukuti Fan", "Choila Specialist",

    // Adventure & Travel
    "Hiking Shivapuri", "Nagarkot Sunrise", "Mustang Trail", "Pokhara Lakes",
    "Gosaikunda Trek", "Chandragiri Cable Car", "Solo Traveler", "Rider (Bullet/Crossfire)",
    "Paragliding", "Bungee Jumper", "Highway Trips", "Off-roading",

    // Urban Life & Hangouts
    "Thamel Nightlife", "Jhamsikhel Cafes", "Durbar Square Walk", "Chobhar Hill",
    "Taudaha Lake", "Rooftop Vibes", "Basantapur Guff", "Patan Art",

    // Career & Academic
    "Lok Sewa Taiyari", "Engineering Struggle", "Medical Life", "IT Geek",
    "Digital Nomad", "Content Creator", "Freelancer", "Entrepreneur",
    "BBS/BBA Squad", "Abroad Studies (IELTS/PTE)",

    // Entertainment & Hobbies
    "K-Pop Fan", "Anime Lover", "Nepali Rock", "Folk Melodies",
    "Netflix Binge", "Gamer (PUBG/Free Fire)", "Futsal Player", "Cricket Fan (Team Nepal)",
    "Guitarist", "Poetry", "Photography", "Sketching", "Tiktok Maker",

    // Lifestyle & Vibe
    "Early Bird", "Night Owl", "Gym Rat", "Yoga & Meditation",
    "Dog Parent", "Cat Lover", "Tea over Coffee", "Spirituality",
    "Fashionista", "Vintage Lover", "Traditional Wear", "Saree Lover"
];

const NEPALI_PERSONALITIES = [
    "Guffadi (Social Bee)", "Sojho (Simple & Kind)", "Batho (Sharp & Clever)",
    "Bindaas (Carefree)", "Ramitey (Crowd Lover)", "Ali Risaha (Short Tempered 🌶️)",
    "Nakhre (Drama Queen/King)", "Maya Lagne (Lovable)", "Khausi (Always Smiling)",
    "Shanta (Calm Soul)", "Hataray (Always in a Hurry)", "Emotional",
    "Sarcastic King/Queen", "Workaholic", "Family First", "Foodie Personality",
    "Bhitrey (Introvert)", "Bahirey (Extrovert)", "Ambivert", "Adventure Junkie",
    "Creative Mind", "Sanskari", "Modern Vibe", "Wanderlust", "Fitness Freak"
];

const NEPALI_VOICE_PROMPTS = [
    "Mero favourite Momo place and why?",
    "Chiya sanga malai sabai bhanda dherai k khana mann lagcha?",
    "Mero perfect Saturday kasto huncha bhane...",
    "Malai sabai bhanda dherai ris uthne kura k ho bhane...",
    "Mero life ko sabai bhanda 'Bindaas' moment...",
    "Mero dream date destination is...",
    "What am I looking for in a partner? (Honestly)",
    "If I were a character in a Nepali movie, I would be...",
    "Mero sabai bhanda baiguney (weird) bani k ho bhane...",
    "Lok Sewa ki Abroad Studies? Mero bichar k cha bhane...",
    "Malai euta gana gauna mann lagyo... (Sing 2 lines!)",
    "Hiking jada malai sabai bhanda k garna mann lagcha?",
    "Mero dream proposal location in Nepal?",
    "Malai sabai bhanda dherai 'Overthink' garaune kura k ho?",
    "If I could change one thing about Kathmandu, it would be...",
    "Mero guilty pleasure Nepali song (don't judge me!)",
    "Street food ki Fine dining? My honest choice...",
    "Aama le 'K bhako esto?' bhannu hune mero euta bani...",
    "Mero favourite 'Chiya Guff' topic?",
    "Travel garda malai 'Window seat' nai kinna parcha bhane...",
    "Night life in Thamel or Peace in Mustang? Choose for me!",
    "Mero sabai bhanda 'Desi' trait k ho?",
    "If I won a lottery, first thing I would buy in Nepal is...",
    "Patan ko galli ki Bhaktapur ko Durbar Square? Where should we go?",
    "Malai sabai bhanda dherai 'Peace' dine thau Nepal ma...",
    "My honest reaction to 'Bihe kahile garne?' question..."
];

const NEPALI_LOOKING_FOR = [
    "Serious Relationship (Bihe ko setting)",
    "Chiya Date Buddy",
    "Bindaas Dating",
    "Traveling Partner (Ghumante)",
    "Just Guff-gaff for now",
    "Long-term relationship",
    "Short-term relationship",
    "Marriage",
    "Not sure"
];

const NEPALI_SMOKING = [
    "Anti-smoke Zone",
    "Hookah / Shisha Lover",
    "Occasionally (Party vibes only)",
    "Regular Smoker",
    "Non-smoker"
];

const NEPALI_DRINKING = [
    "Chiya over Beer",
    "Bhoj ma matrai (Social)",
    "Raksi Handler",
    "Occasionally",
    "Regular Drinker",
    "Teetotaler"
];

const NEPALI_WORKOUT = [
    "Futsal every Friday",
    "Morning Walk (Tundikhel vibe)",
    "Gym Rat / Fitness Freak",
    "Home Yoga & Meditation",
    "Never",
    "Sometimes",
    "Regularly"
];

const NEPALI_HOMETOWNS = [
    "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Bharatpur", "Biratnagar", "Birgunj", "Janakpur",
    "Ghorahi", "Hetauda", "Dharan", "Itahari", "Butwal", "Nepalgunj", "Dhangadhi", "Birtamod",
    "Damak", "Lumbini", "Gorkha", "Mustang", "Manang", "Solukhumbu", "Ilam", "Dhankuta", "Palpa",
    "Syangja", "Kaski", "Chitwan", "Surkhet", "Baglung", "Gulmi", "Arghakhanchi", "Pyuthan", "Rolpa",
    "Dang", "Banke", "Bardia", "Kailali", "Kanchanpur", "Jhapa", "Morang", "Sunsari", "Saptari",
    "Siraha", "Dhanusha", "Mahottari", "Sarlahi", "Rautahat", "Bara", "Parsa", "Makwanpur", "Sindhuli",
    "Ramechhap", "Dolakha", "Sindhupalchok", "Kavre", "Nuwakot", "Rasuwa", "Dhading"
];

const NEPALI_DATE_VIBES = [
    "Momo & Walk in Basantapur",
    "Chiya Guff at a local galli",
    "Evening vibes at Jhamel",
    "Short hike to Shivapuri/Nagarkot",
    "Thamel Nightlife & Live Music",
    "Patan Museum & Coffee",
    "Chandragiri Cable Car Trip",
    "Street Food Hunt in Birtamod/Dharan",
    "Lakeside Stroll in Pokhara",
    "Movie Date in QFX"
];

const NEPALI_SLANG_BADGES = [
    "Maya Ho",
    "Yestai Ho",
    "Khana Khayau?",
    "Guffadi",
    "Alchi",
    "Bindaas",
    "Sojho Keta/Keti",
    "Batho",
    "Ramitey",
    "Nakhrebaaj"
];

const NEPALI_RASHI = [
    "Mesh (Aries)",
    "Brish (Taurus)",
    "Mithun (Gemini)",
    "Karkat (Cancer)",
    "Simha (Leo)",
    "Kanya (Virgo)",
    "Tula (Libra)",
    "Brishchik (Scorpio)",
    "Dhanu (Sagittarius)",
    "Makar (Capricorn)",
    "Kumbha (Aquarius)",
    "Meen (Pisces)"
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
