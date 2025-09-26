// Import necessary discord.js modules
const { Events, ActivityType } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(miyuki) {
        console.log(`[${miyuki.user.username}] Snowfox maiden is ready to serve!`);
        miyuki.user.setActivity('with Snow Foxes', { type: ActivityType.Playing });
    }
}