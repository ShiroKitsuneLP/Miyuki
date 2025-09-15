// Import necessary classes from discord.js
const { Events, EmbedBuilder } = require('discord.js');

// Import Discord Links from config.json
const { discordLinks } = require('../../config/config.json');

// Import color configuration
const { color } = require('../../config/color.json');

module.exports = {
    name: Events.GuildCreate,
    once: false,
    async execute(guild, miyuki) {

        // Owner notification
        const owner = await miyuki.users.fetch(guild.ownerId);

        // Create an embed message for the guild join notification
        const ownerDMEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle('Thank your for choosing Miyuki!')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setThumbnail(miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 }))
            .setDescription(`Hello! I'm Miyuki, your helpful companion on Discord. Thank you for inviting me to **${guild.name}**! \n\nI'm here to bring some fun and useful tools to your server. Let's make your community even better together! ❤️`)
            .addFields(
                { name: 'Getting Started', value: 'To get started, you can use the `/help` command to see a list of all my available commands and features. If you need any assistance or have questions, feel free to reach out!' },

                // Spacer
                { name: '', value: '' },

                // Support Info
                { name: 'Need Help or Found a Bug?', value: `If you need any help or want to report a bug, please join our **Support Server** or open an Issue on GitHub!` },

                { name: 'Miyuki\'s Hideout', value: `[Click Here](${discordLinks.supportServer})`, inline: true },
                { name: 'Website', value: `[Click Here](${discordLinks.website})`, inline: true }
            );

        // Send the DM to the guild owner
        await owner.send({ embeds: [ownerDMEmbed] });
    }
}