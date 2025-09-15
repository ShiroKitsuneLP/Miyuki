// Import necessary classes from discord.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Import the warn repository
const { warn } = require('../../db/repo');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Clears all warnings for a user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to clear warnings for')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    usage: '/clearwarns <user>',
    async execute(interaction, miyuki) {

        // Get command options
        const user = interaction.options.getUser('user');
        const guildId = interaction.guild.id;

        // Clear warnings from database
        const changes = warn.clearUser(guildId, user.id);

        // Create embed
        let embed;
        if (changes > 0) {
            embed = new EmbedBuilder()
                .setTitle('Warns Cleared')
                .setColor(color.success)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription(`Cleared **${changes}** warning(s) for ${user}.`);
        } else {
            embed = new EmbedBuilder()
                .setTitle('No Warns Found')
                .setColor(color.default)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription(`${user} has no warnings to clear.`);
        }

        await interaction.reply({ embeds: [embed] });
    }
};
