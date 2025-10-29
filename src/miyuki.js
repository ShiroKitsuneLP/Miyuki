// Import nessesary discord.js modules
const { Client, GatewayIntentBits } = require("discord.js");

// Import necessary modules
const path = require("path");

// Import Config
const { mainBot, adminBot } = require(path.join(__dirname, "./config/config.json"));

// Import loader
const { commandLoader, eventLoader } = require(path.join(__dirname, "./utils/loader"));

// Import database connection
require(path.join(__dirname, './database/db'));

// Create a new main client instance with necessary intents
const miyuki = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent
    ]
});

// Create a new admin client instance with necessary intents
const miyukiAdmin = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Function to start both bots
async function startBots() {

    // Load Commands and Events and start the main bot
    await commandLoader(miyuki, path.join(__dirname, 'commands'), 'Miyuki');
    await eventLoader(miyuki, path.join(__dirname, 'events'), 'Miyuki');

    if (!mainBot.token) {
        console.error("[Error] Discord Main token not found in config.json");
        process.exit(1);
    }

    await miyuki.login(mainBot.token);

    // Load Commands and Events and start the admin bot
    await commandLoader(miyukiAdmin, path.join(__dirname, 'adminCommands'), 'Miyuki Admin');
    await eventLoader(miyukiAdmin, path.join(__dirname, 'adminEvents'), 'Miyuki Admin');

    if (!adminBot.token) {
        console.error("[Error] Discord Admin token not found in config.json");
        process.exit(1);
    }

    await miyukiAdmin.login(adminBot.token);
}

// Start both bots
startBots();

// Import scheduler
const { startSchedulers } = require(path.join(__dirname, './utils/scheduler'));

// Start Scheduler tasks
startSchedulers();