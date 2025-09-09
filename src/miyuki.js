// Import required classes from discord.js
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

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

// Initialize collections for events
miyuki.events = new Collection();

// Define paths to events folders
const eventsFolderPath = path.join(__dirname, 'events');
const eventFolders = fs.readdirSync(eventsFolderPath);

// Load event files
for (const folder of eventFolders) {
    const eventsPath = path.join(eventsFolderPath, folder);
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (!event.name) {
            console.log(`[WARNING] The event at ${filePath} is missing a "name" property.`);
            continue;
        }
        if (event.once) {
            miyuki.once(event.name, (...args) => event.execute(...args, miyuki));
        } else {
            miyuki.on(event.name, (...args) => event.execute(...args, miyuki));
        }
        miyuki.events.set(event.name, event);
    }
}

// Check if a token is provided
if (!discord.token) {
    console.error('Discord token is not provided in config.json');
    process.exit(1);
}

// Start the bot with the provided token
miyuki.login(discord.token);