// Import nessesary discord.js modules
const { Client, GatewayIntentBits } = require("discord.js");

// Import Config
const { mainBot } = require("./config/config.json");

// Create a new main client instance with necessary intents
const miyuki = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Check if token is provided
if (!mainBot.token) {
    console.error("[Error] Discord Main token not found in config.json");
    process.exit(1);
}

// Login to Discord with your client's token
miyuki.login(mainBot.token);