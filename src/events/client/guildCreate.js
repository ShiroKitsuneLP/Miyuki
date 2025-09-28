// Import necessary discord.js modules
const { Events } = require("discord.js");

// Import necessary modules
const path = require("path");

// Import embedBuilder
const { createMiyukiEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import Links from config
const { links } = require(path.join(__dirname, './../../config/config.json'));

module.exports = {
    name: Events.GuildCreate,
    once: false,
    async execute(guild, miyuki) {

        // Get the owner of the guild
        const owner = await guild.fetchOwner().catch(() => null);

        // Send a welcome message to the guild owner if possible
        try {
            await owner.send({ embeds: [createMiyukiEmbed(miyuki, {
                title: 'Thank you for choosing Miyuki!',
                description: `Hello! I'm Miyuki, your helpful companion on Discord. Thank you for inviting me to **${guild.name}**! \n\nI'm here to bring some fun and useful tools to your server. Let's make your community even better together! ❤️`,
                fields: [
                    { name: 'Getting Started', value: 'To get started, you can use the `/help` command to see a list of all my available commands and features. If you need any assistance or have questions, feel free to reach out!' },

                    // Spacer
                    { name: '', value: '' },

                    // Support Info
                    { name: 'Need Help or Found a Bug?', value: `If you need any help or want to report a bug, please join our **Support Server** or open an Issue on GitHub!` },

                    // Spacer
                    { name: '', value: '' },

                    { name: 'Miyuki\'s Hideout', value: `[Click Here](${links.supportServer})`, inline: true },
                    { name: 'Website', value: `[Click Here](${links.website})`, inline: true }
                ],
                footer: { text: 'Made with ❤️ by Shiro' }
            })] });
        } catch (error) {
            // Unable to send DM to the guild owner
        }
    }
}