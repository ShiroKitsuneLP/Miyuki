const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`${client.user.username} is now Online.`);
        client.user.setActivity('with Snow Foxes', { type: ActivityType.Playing });
    }
}