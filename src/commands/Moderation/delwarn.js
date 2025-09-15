// Import necessary classes from discord.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Import the warn repository
const { warn } = require('../../db/repo');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delwarn')
        .setDescription('Deletes a specific warning by its ID.')
        .addIntegerOption(option => 
            option.setName('id')
                .setDescription('Warning ID')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    usage: '/delwarn <id>',
    async execute(interaction, miyuki) {

        // Get command options
        const warnId = interaction.options.getInteger('id');

        // Delete warning from database
        const changes = warn.deleteById(warnId);

        // Create embed
        let embed;
        if (changes > 0) {
            embed = new EmbedBuilder()
                .setTitle('Warning Deleted')
                .setColor(color.success)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription(`Warning #${warnId} has been deleted.`);
        } else {
            embed = new EmbedBuilder()
                .setTitle('Warning Not Found')
                .setColor(color.default)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription(`No warning found with ID #${warnId}.`);
        }
        await interaction.reply({ embeds: [embed] });
    }
};
