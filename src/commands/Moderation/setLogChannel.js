// Import necessary discord.js modules
const { log } = require('console');
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed, createErrorEmbed, createSuccessEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

// Import error handler
const { errorHandler } = require(path.join(__dirname, './../../utils/errorHandler'));

// Import guild settings database repo
const { guildSettings } = require(path.join(__dirname, './../../database/repo'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogchannel')
        .setDescription('Set the log channel for moderation logs')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set as the log channel')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),
    category: 'Moderation',
    usage: '/setlogchannel <channel>',
    async execute(interaction, miyuki) {

        // Ensure the command is used in a guild
        if (!interaction.inGuild()) {
            return interaction.reply({ embeds: [createErrorEmbed(miyuki, {
                title: 'Guild Only Command',
                description: 'This command can only be used in a server.'
            })] });
        }

        // Defer the reply to allow more time for processing
        await interaction.deferReply();

        try {

            // Get the specified channel
            const channel = interaction.options.getChannel('channel');

            // Ensure guild entry exists in DB
            if (!guildSettings.getLogChannel(interaction.guild.id)) {
                if (guildSettings.addGuild) {
                    guildSettings.addGuild(interaction.guild.id);
                }
            }

            // Update the log channel in the database
            guildSettings.setLogChannel(interaction.guild.id, channel.id);
            console.log('Set log channel to:', channel.id, 'for guild:', interaction.guild.id);

            // Send success embed to user
            await interaction.editReply({ embeds: [createSuccessEmbed(miyuki, {
                title: 'Log Channel Set',
                description: `Successfully set ${channel} as the log channel for moderation logs.`
            })] });

            // Send notification in the log channel
            const logChannelId = guildSettings.getLogChannel(interaction.guild.id);
            const logChannelObj = interaction.guild.channels.cache.get(logChannelId);

            if (logChannelObj && logChannelObj.isTextBased()) {

                try {
                    await logChannelObj.send({ embeds: [createMiyukiEmbed(miyuki, {
                        title: 'Log Channel Updated',
                        description: `This channel has been set as the log channel for moderation logs by ${interaction.user}.`
                    })] });

                } catch (err) {
                    // Fallback
                }
            }

        } catch (error) {

            // Log error in database
            errorHandler(error, {
                context: 'Command',
                file: 'setLogChannel'
            });

            try {

                // Send error embed
                return interaction.editReply({ embeds: [createErrorEmbed(miyuki, {
                    description: 'An unexpected error occurred while executing the command. Please try again later.'
                })] });

            } catch (err) {
                // Fallback
            }
        }
    }
}