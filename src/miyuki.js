// Import nessesary discord.js modules
const { Client, GatewayIntentBits } = require("discord.js");

// Import necessary modules
const path = require("path");

// Import Config
const { mainBot } = require(path.join(__dirname, "./config/config.json"));

// Import loader
const { commandLoader, eventLoader } = require(path.join(__dirname, "./utils/loader"));

// Create a new main client instance with necessary intents
const miyuki = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Load Commands
commandLoader(miyuki, path.join(__dirname, 'commands'), 'Miyuki');

// Load Events
eventLoader(miyuki, path.join(__dirname, 'events'), 'Miyuki');

// Check if token is provided
if (!mainBot.token) {
    console.error("[Error] Discord Main token not found in config.json");
    process.exit(1);
}

// Login to Discord with your client's token
miyuki.login(mainBot.token);