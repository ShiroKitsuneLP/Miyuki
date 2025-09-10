// Import necessary classes from discord.js
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// Import nasessary modules
const fs = require('fs');
const path = require('path');

// Import Discord token from config.json
const { discord } = require('./config/config.json');

// Create a new Discord client with the necessary intents
const miyuki = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Initialize collections for events
miyuki.commands = new Collection();
miyuki.events = new Collection();

// Define paths to commands folders
const commandsFolderPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsFolderPath);

// Load command files
for (const folder of commandFolders) {
    const commandsPath = path.join(commandsFolderPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            miyuki.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

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