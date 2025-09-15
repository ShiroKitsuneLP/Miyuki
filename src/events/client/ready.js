// Import necessary classes from discord.js
const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(miyuki) {

        // Log when the bot is ready and set its activity
        console.log(`${miyuki.user.username} is now Online.`);
        miyuki.user.setActivity('with Snow Foxes', { type: ActivityType.Playing });
    }
}