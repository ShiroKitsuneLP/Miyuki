// Import necessary discord.js modules
const { REST, Routes } = require('discord.js');

// Import necessary modules
const fs = require('fs');
const path = require('path');

// Import Config
const { mainBot, adminBot } = require(path.join(__dirname, './../config/config.json'));

// Function to load commands
function commandLoader(folderPath) {
    const commands = [];

    const folders = fs.readdirSync(folderPath);

    for (const folder of folders) {
        const filesPath = path.join(folderPath, folder);
        const files = fs.readdirSync(filesPath).filter(file => file.endsWith('.js'));

        for (const file of files) {
            const filePath = path.join(filesPath, file);
            const command = require(filePath);

            if(command.data) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" property.`);
            }
        }
    }
    return commands;
}

// check if token is provided
if (!mainBot.token) {
    console.error("[Error] Discord Main token not found in config.json");
    process.exit(1);
}

if (!adminBot.token) {
    console.error("[Error] Discord Admin token not found in config.json");
    process.exit(1);
}

// Check for command line arguments
const admin = process.argv.includes('--admin');
const global = process.argv.includes('--global');
const guild = process.argv.includes('--guild');

// Check if at least one argument is provided
if (!admin && !global && !guild) {
    console.error('[Error] Please provide at least one argument: --admin, --global or --guild');
    process.exit(1);
}

// Load commands
const commands = commandLoader(path.join(__dirname, './../commands'));
const adminCommands = commandLoader(path.join(__dirname, './../adminCommands'));

// Initialize REST client
const mainRest = new REST({ version: '10' }).setToken(mainBot.token);
const adminRest = new REST({ version: '10' }).setToken(adminBot.token);

// Deploy commands
(async () => {
    try {
        if (admin) {
            if (!adminBot.guildId) {
                console.error('[Error] Admin Guild ID not found in config.json');
                process.exit(1);
            }

            console.log(`[Miyuki Admin] Deploying ${adminCommands.length} commands to guild ID ${adminBot.guildId}...`);

            const data = await adminRest.put(
                Routes.applicationGuildCommands(adminBot.clientId, adminBot.guildId),
                { body: adminCommands }
            );

            console.log(`[Miyuki Admin] Successfully deployed ${data.length} commands to guild ID ${adminBot.guildId}.`);
        }

        if (global) {
            console.log(`[Miyuki] Deploying ${commands.length} global commands...`);
            
            const data = await mainRest.put(
                Routes.applicationCommands(mainBot.clientId),
                { body: commands }
            );

            console.log(`[Miyuki] Successfully deployed ${data.length} global commands.`);
        }

        if (guild) {
            if (!mainBot.guildId) {
                console.error('[Error] Guild ID not found in config.json');
                process.exit(1);
            }

            console.log(`[Miyuki] Deploying ${commands.length} commands to guild ID ${mainBot.guildId}...`);
            
            const data = await mainRest.put(
                Routes.applicationGuildCommands(mainBot.clientId, mainBot.guildId),
                { body: commands }
            );

            console.log(`[Miyuki] Successfully deployed ${data.length} commands to guild ID ${mainBot.guildId}.`);
        }
    } catch (error) {
        console.error('[Error] Failed to deploy commands:', error);
    }
})();