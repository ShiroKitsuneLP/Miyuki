// Import necessary Discord.js classes
const { Collection } = require('discord.js');

// Import necessary modules
const fs = require('fs');
const path = require('path');

// Function to Load Commands
function commandLoader(client, folderPath, clientName = 'Client') {
    client.commands = new Collection();

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

            // Check if Command File has Data Property
            if(!command.data) {
                console.log(`[Warning] The Command at ${filePath} is missing a "data" property.`);
                continue;
            }

            //Check if Command File has a Execute
            if(!command.execute) {
                console.log(`[Warning] The Command at ${filePath} is missing a execute`);
                continue;
            }

            // Register the Command
            client.commands.set(command.data.name, command);

            loadedCommands++;
        }
    }

    console.log(`[${clientName}] Loaded ${loadedCommands} of ${foundCommands} Command.`);
}

// Function to Load Events
function eventLoader(client, folderPath, clientName = 'Client') {
    client.events = new Collection();

    const folders = fs.readdirSync(folderPath);

    let foundEvents = 0;
    let loadedEvents = 0;

    // Get all Event Subfolder
    for (const folder of folders) {
        const filesPath = path.join(folderPath, folder);
        const files = fs.readdirSync(filesPath).filter(file => file.endsWith('.js'));

        // Get all Event Files
        for (const file of files) {
            const filePath = path.join(filesPath, file);
            let event;

            try {
                event = require(filePath);
            } catch (error) {
                console.log(`[Error] Failed to load Event at ${filePath}: ${error.message}`);
                continue;
            }

            foundEvents++;

            // Check if Event File has Name Property
            if(!event.name) {
                console.log(`[Warning] The Event at ${filePath} is missing a "name" property.`);
                continue;
            }

            //Check if Event File has a Execute
            if(!event.execute) {
                console.log(`[Warning] The Event at ${filePath} is missing a execute`);
                continue;
            }

            // Register the Event
            // 'once' for Events that should only trigger once
            // 'on' for Events that can trigger multiple times
            if(event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }

            loadedEvents++;
        }
    }

    console.log(`[${clientName}] Loaded ${loadedEvents} of ${foundEvents} events.`);
}

module.exports = {
    commandLoader,
    eventLoader
}