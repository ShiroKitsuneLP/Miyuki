// Import necessary Discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');

// Import necessary moduls
const path = require('path');

// Import Config
const { mainClient, adminClient } = require(path.resolve(__dirname, '../config/config.json'));

// Import Loader
const { commandLoader, eventLoader } = require(path.join(__dirname, '/loader'));

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

    // Check if Client Tokens are provided
    if (!mainClient.token) {
        console.error("[Error] Main Client token not found in config.json");
        process.exit(1);
    }

    if (!adminClient.token) {
        console.error("[Error] Admin Client token not found in config.json");
        process.exit(1);
    }

    // Load Commands
    await commandLoader(miyuki, path.resolve(__dirname, '../commands'), 'Miyuki');
    await commandLoader(miyukiAdmin, path.resolve(__dirname, '../adminCommands'), 'Miyuki Admin');

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