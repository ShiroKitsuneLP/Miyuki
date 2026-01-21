// Import necessary Discord.js classes
const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(miyukiAdmin) {
        console.log(`[${miyukiAdmin.user.username}] Snowfox maiden is watching over the data realm.`);
    }
}