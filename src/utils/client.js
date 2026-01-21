// Import necessary Discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');

// Import necessary moduls
const path = require('path');

// Import Config
const { mainClient, adminClient } = require(path.join(__dirname, './../config/config.json'));

// Import Loader
const { eventLoader } = require(path.join(__dirname, '/loader'));

// Intents for Miyuki
const miyukiIntents = {
    main: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent
    ],
    admin: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
};

// Function to create Clients
function createClient(intents, options = {}) {
    if (!Array.isArray(intents) || intents.length === 0) {
        throw new Error('[Error] Intents Array is missing or empty.');
    }

    return new Client({ intents, ...options });
}

// Function to start Miyuki's Bots
async function startMiyuki() {

    // Create Miyuki's Clients
    const miyuki = createClient(miyukiIntents.main);
    const miyukiAdmin = createClient(miyukiIntents.admin);

    // Load Events
    await eventLoader(miyuki, path.resolve(__dirname, '../events'), 'Miyuki');
    await eventLoader(miyukiAdmin, path.resolve(__dirname, '../adminEvents'), 'Miyuki Admin');

    // Start Clients
    await Promise.all([
        miyuki.login(mainClient.token),
        miyukiAdmin.login(adminClient.token)
    ]);
}

module.exports = { startMiyuki }