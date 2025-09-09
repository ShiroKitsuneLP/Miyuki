// Import required classes from discord.js
const { Client, GatewayIntentBits } = require('discord.js');

// Load Discord token from config.json
const { discord } = require('./config/config.json');

// Create a new Discord client with the necessary intents
const miyuki = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Event: Triggered when the bot is ready
miyuki.once('clientReady', () => {
    console.log('Miyuki is online!');
});

// Check if a token is provided
if (!discord.token) {
    console.error('Discord token is not provided in config.json');
    process.exit(1);
}

// Start the bot with the provided token
miyuki.login(discord.token);