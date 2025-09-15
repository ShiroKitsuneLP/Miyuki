// Import necessary classes from discord.js
const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(miyukiAdmin) {

        // Log when the bot is ready and set its activity
        console.log(`${miyukiAdmin.user.username} is now Online.`);
        miyukiAdmin.user.setActivity('with Snow Foxes', { type: ActivityType.Playing });
    }
}