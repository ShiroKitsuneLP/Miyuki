// Import necessary Discord.js classes
const { REST, Routes } = require('discord.js');

// Import necessary modules
const fs = require('fs');
const path = require('path');

// Import Config
const { mainClient, adminClient } = require(path.join(__dirname, './../config/config.json'));

function commandLoader(folderPath) {
    const commands = [];

    const folders = fs.readdirSync(folderPath);

    let foundCommands = 0;
    let loadedCommands = 0;

    // Get all Command Subfolder
    for (const folder of folders) {
        const filesPath = path.join(folderPath, folder);
        const files = fs.readdirSync(filesPath).filter(file => file.endsWith('.js'));

        // Get all Command Files
        for (const file of files) {
            const filePath = path.join(filesPath, file);
            let command;
            
            try {
                command = require(filePath);
            } catch (error) {
                console.log(`[Error] Failed to load Command at ${filePath}: ${error.message}`);
                continue;
            }

            foundCommands++;

            if (command.data) {
                commands.push(command.data.toJSON());
                loadedCommands++;
            } else {
                console.log(`[Warning] The Command at ${filePath} is missing a "data" property.`);
                continue;
            }
        }
    }
    console.log(`[Deploy] Loaded ${loadedCommands} of ${foundCommands} Command.`);

    return commands;
}

// Check if Client Tokens are provided
if (!mainClient.token) {
    console.error("[Error] Main Client token not found in config.json");
    process.exit(1);
}

if (!adminClient.token) {
    console.error("[Error] Admin Client token not found in config.json");
    process.exit(1);
}

/// Check for Command Line Arguments
const admin = process.argv.includes('--admin');
const guild = process.argv.includes('--guild');
const public = process.argv.includes('--public');

// Check if one of the Command Line Arguments are provided
if (!admin && !guild && !public) {
    console.error('[Error] Please provide at least one argument: --admin, --guild or --public');
    process.exit(1);
}


// Initialize REST client
const mainRest = new REST({ version: '10' }).setToken(mainClient.token);
const adminRest = new REST({ version: '10' }).setToken(adminClient.token);

// Deploy Commands
(async () => {
    try {
        // Deploy Admin Commands
        if (admin) {
            
            // Load Commands
            const adminCommands = commandLoader(path.resolve(__dirname, '../adminCommands'));

            if (!adminClient.guildId) {
                console.error('[Error] Admin Client Guild ID not found in config.json');
                process.exit(1);
            }

            console.log(`[Miyuki Admin] Deploying ${adminCommands.length} commands to guild ID ${adminClient.guildId} ...`);

            const data = await adminRest.put(
                Routes.applicationGuildCommands(adminClient.clientId, adminClient.guildId),
                { body: adminCommands }
            );

            console.log(`[Miyuki Admin] Successfully deployed ${data.length} commands to guild ID ${adminClient.guildId}.`);
        }

        // Deploy Commands on a specific Guild
        if (guild) {

            // Load Commands
            const commands = commandLoader(path.resolve(__dirname, '../commands'));

            if (!mainClient.guildId) {
                console.error('[Error] Main Client Guild ID not found in config.json');
                process.exit(1);
            }

            console.log(`[Miyuki] Deploying ${commands.length} commands to guild ID ${mainClient.guildId} ...`);

            const data = await mainRest.put(
                Routes.applicationGuildCommands(mainClient.clientId, mainClient.guildId),
                { body: commands }
            );

            console.log(`[Miyuki] Successfully deployed ${data.length} commands to guild ID ${mainClient.guildId}.`);
        }

        // Deploy Commands Public
        if (public) {

            // Load Commands
            const commands = commandLoader(path.resolve(__dirname, '../commands'));

            console.log(`[Miyuki] Deploying ${commands.length} commands global ...`);

            const data = await mainRest.put(
                Routes.applicationCommands(mainClient.clientId),
                { body: commands }
            );

            console.log(`[Miyuki] Successfully deployed ${data.length} commands global.`);
        }
    } catch (error) {
        console.error('[Error] Failed to deploy commands:', error);
    }
})();