// Import necessary classes from discord.js
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// Import nasessary modules
const fs = require('fs');
const path = require('path');

// Import the schema setup function
const { setupSchema } = require('./db/schema');

// Import Discord token from config.json
const { discord, discordAdmin } = require('./config/config.json');

function loadFiles(client, type, folderPath, botName) {
    client[type] = new Collection();

    const folders = fs.readdirSync(folderPath);

    for (const folder of folders) {
        const filesPath = path.join(folderPath, folder);
        const files = fs.readdirSync(filesPath).filter(file => file.endsWith('.js'));

        for (const file of files) {
            const filePath = path.join(filesPath, file);
            const item = require(filePath);

            // Loads the commands
            if (type === 'commands' && 'data' in item && 'execute' in item) {
                client.commands.set(item.data.name, item);
                console.log(`[BOT] Command "${item.data.name}" loaded for ${botName}.`);
            } else if (type === 'events' && 'name' in item) {
                if (item.once) {
                    client.once(item.name, (...args) => item.execute(...args, client));
                } else {
                    client.on(item.name, (...args) => item.execute(...args, client));
                }
                console.log(`[BOT] Event "${item.name}" loaded for ${botName}.`);
            } else {
                console.log(`[WARNING] File "${filePath}" is missing a required 'data'/'execute' or 'name' property.`);
            }
        }
    }
}

// Create a new Discord client with the necessary intents
const miyuki = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Create a new Admin Discord client with the necessary intents
const miyukiAdmin = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Import the database to check if it exists on startup
require('./db/database');

// Ensure all database schemas are set up
setupSchema();

// Load commands and events for main client
loadFiles(miyuki, 'commands', path.join(__dirname, 'commands'), 'Miyuki');
loadFiles(miyuki, 'events', path.join(__dirname, 'events'), 'Miyuki');

// Load commands and events for admin client
loadFiles(miyukiAdmin, 'commands', path.join(__dirname, 'adminCommands'), 'Miyuki Admin');
loadFiles(miyukiAdmin, 'events', path.join(__dirname, 'adminEvents'), 'Miyuki Admin');

// Check if a token is provided
if (!discord.token) {
    console.error('Discord token is not provided in config.json');
    process.exit(1);
}

if (!discordAdmin.token) {
    console.error('Discord Admin token is not provided in config.json');
    process.exit(1);
}

// Start the bot with the provided token
miyuki.login(discord.token);
miyukiAdmin.login(discordAdmin.token);