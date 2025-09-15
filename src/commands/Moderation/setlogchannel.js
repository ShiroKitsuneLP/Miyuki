// Import necessary classes from discord.js
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, MessageFlags } = require('discord.js');

// Import the logchannel repository
const { logchannel } = require('../../db/repo');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogchannel')
        .setDescription('Set the log channel for Miyuki.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to use for logs')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    usage: '/setlogchannel <channel>',
    async execute(interaction, miyuki) {

        // Get command options
        const channel = interaction.options.getChannel('channel');

        // Validate channel type
        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'Please select a valid text channel.', flags: MessageFlags.Ephemeral });
        }

        // Save log channel to database
        logchannel.set(interaction.guild.id, channel.id);

        // Create and send confirmation embed
        const embed = new EmbedBuilder()
            .setColor(color.success)
            .setTitle('Log Channel Set')
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setDescription(`Logchannel has been set to <#${channel.id}>.`)

        await interaction.reply({ embeds: [embed] });
    }
};
