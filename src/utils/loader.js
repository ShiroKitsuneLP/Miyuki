// Import nessesary discord.js modules
const { Collection } = require('discord.js');

// Import necessary modules
const fs = require('fs');
const path = require('path');

// Function to Load Event files
function eventLoader(client, folderPath, botName = 'Bot') {
    client.events = new Collection();

    const folders = fs.readdirSync(folderPath);

    let foundEvents = 0;
    let loadedEvents = 0;

    for (const folder of folders) {
        const filesPath = path.join(folderPath, folder);
        const files = fs.readdirSync(filesPath).filter(file => file.endsWith('.js'));

        for (const file of files) {
            const filePath = path.join(filesPath, file);
            const event = require(filePath);

            foundEvents++;

            if(!event.name) {
                console.log(`[WARNING] The event at ${filePath} is missing a "name" property.`);
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

    console.log(`[${botName}] Loaded ${loadedEvents} of ${foundEvents} events.`);
}

module.exports = { eventLoader };