// Import necessary classes from discord.js
const { REST, Routes } = require('discord.js');

// Import nasessary modules
const fs = require('fs');
const path = require('path');

// Load Discord token, clientId and guildId from config.json
const { discord, discordAdmin } = require('./config/config.json');

// Function to load commands
function loadCommands(folderPath) {
    const commands = [];
    const folders = fs.readdirSync(folderPath);

    for (const folder of folders) {
        const commandsPath = path.join(folderPath, folder);
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
    return commands;
}

// Check for command line arguments
const global = process.argv.includes('--global');
const guild = process.argv.includes('--guild');
const admin = process.argv.includes('--admin');

// Check if at least one argument is provided
if (!global && !guild && !admin) {
    console.error('Please specify either --global, --guild, or --admin as an argument.');
    process.exit(1);
}

// Load commands
const commands = loadCommands(path.join(__dirname, 'commands'));

// Load admin commands
const adminCommands = loadCommands(path.join(__dirname, 'adminCommands'));

// Initialize REST client
const rest = new REST().setToken(discord.token);
const adminRest = new REST().setToken(discordAdmin.token);

// Deploy commands
(async () => {
    try {
        if (global) {
            console.log(`Started refreshing ${commands.length} global application (/) commands.`);
            const data = await rest.put(
                Routes.applicationCommands(discord.clientId),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} global application (/) commands.`);
        }

        if (guild) {
            if (!discord.guildId) {
                console.error('guildId is not specified in config.json');
                process.exit(1);
            }
            console.log(`Started refreshing ${commands.length} guild application (/) commands for guild ID ${discord.guildId}.`);
            const data = await rest.put(
                Routes.applicationGuildCommands(discord.clientId, discord.guildId),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} guild application (/) commands for guild ID ${discord.guildId}.`);
        }

        if (admin) {
            if (!discordAdmin.guildId) {
                console.error('Admin guildId is not specified in config.json');
                process.exit(1);
            }
            console.log(`Started refreshing ${adminCommands.length} admin guild application (/) commands for guild ID ${discordAdmin.guildId}.`);
            const data = await adminRest.put(
                Routes.applicationGuildCommands(discordAdmin.clientId, discordAdmin.guildId),
                { body: adminCommands },
            );
            console.log(`Successfully reloaded ${data.length} admin guild application (/) commands for guild ID ${discordAdmin.guildId}.`);
        }
    } catch (error) {
        console.error(error);
    }
})();