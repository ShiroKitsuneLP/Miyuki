// Import necessary classes from discord.js
const { REST, Routes } = require('discord.js');

// Import nasessary modules
const fs = require('fs');
const path = require('path');

// Load Discord token, clientId and guildId from config.json
const { discord } = require('./config/config.json');

// Command array to hold all commands
const commands = [];
const commandsFolderPath = path.join(__dirname, 'commands');
const commandFolder = fs.readdirSync(commandsFolderPath);

// Load command files
for (const folder of commandFolder) {
    const commandsPath = path.join(commandsFolderPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Check for command line arguments
const global = process.argv.includes('--global');
const guild = process.argv.includes('--guild');

// Check if at least one argument is provided
if (!global && !guild) {
    console.error('Please specify either --global or --guild as an argument.');
    process.exit(1);
}

// Initialize REST client
const rest = new REST().setToken(discord.token);

// Deploy Commands global
if (global) {
    console.log('Deploying commands globally...');
    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
            const data = await rest.put(
                Routes.applicationCommands(discord.clientId),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (err) {
            console.error(`Error loading commands: ${err}`);
        }
    })();

}

// Deploy Commands to a specific guild
if (guild) {
    console.log('Deploying commands to a specific guild...');
    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} guild (/) commands.`);
            const data = await rest.put(
                Routes.applicationGuildCommands(discord.clientId, discord.guildId),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} guild (/) commands.`);
        } catch (err) {
            console.error(`Error loading commands: ${err}`);
        }
    })();
}