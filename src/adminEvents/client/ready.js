// Import necessary discord.js modules
const { Events, ActivityType } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(miyukiAdmin) {
        console.log(`[${miyukiAdmin.user.username}] Snowfox maiden is watching over the data realm.`);
        miyukiAdmin.user.setActivity('the data flow', { type: ActivityType.Watching });
    }
}