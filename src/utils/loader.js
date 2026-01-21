// Import necessary Discord.js classes
const { Collection } = require('discord.js');

// Import necessary modules
const fs = require('fs');
const path = require('path');

// Function to Load Commands
function commandLoader() {
    // Comming Soon
}

// Function to Load Events
function eventLoader(client, folderPath, clientName = 'Client') {
    client.events = new Collection();

    const folders = fs.readdirSync(folderPath);

    let foundEvents = 0;
    let loadedEvents = 0;

    for (const folder of folders) {
        const filesPath = path.join(folderPath, folder);
        const files = fs.readdirSync(filesPath).filter(file => file.endsWith('.js'));

        for (const file of files) {
            const filePath = path.join(filesPath, file);
            let event;

            try {
                event = require(filePath);
            } catch (error) {
                console.log(`[Error] Failed to load event at ${filePath}: ${error.message}`);
                continue;
            }

            foundEvents++;

            if(!event.name) {
                console.log(`[Warning] The event at ${filePath} is missing a "name" property.`);
                continue;
            }

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
    eventLoader
}