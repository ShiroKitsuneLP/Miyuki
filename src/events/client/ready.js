// Import necessary classes from discord.js
const { Events, ActivityType } = require('discord.js');

// Import the database to check if it exists on startup
const db = require('../../db/database');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {

        // Log when the bot is ready and set its activity
        console.log(`${client.user.username} is now Online.`);
        client.user.setActivity('with Snow Foxes', { type: ActivityType.Playing });
    }
}