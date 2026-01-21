// Import necessary Discord.js classes
const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(miyuki) {
        console.log(`[${miyuki.user.username}] Snowfox maiden is ready to serve!`);
    }
}