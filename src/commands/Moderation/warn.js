// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

// Import the warn repository
const { warn } = require('../../db/repo');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to warn')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for warning')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    usage: '/warn <user> [reason]',
    async execute(interaction, miyuki) {

        // Ensure the command is used in a guild
        if (!interaction.inGuild()) {
            return interaction.reply({ embeds: [errorEmbed('This command can only be used in a server.')], flags: MessageFlags.Ephemeral });
        }

        // Get command options
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const guildId = interaction.guild.id;
        const moderatorId = interaction.user.id;

        // Add warning to database
        warn.add(guildId, user.id, moderatorId, reason);
        const warnCount = warn.getCount(guildId, user.id);

        // Create embed
        const warnEmbed = new EmbedBuilder()
            .setTitle('User Warned')
            .setColor(color.warn)
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setDescription(`${user} has been warned.`)
            .addFields(
                { name: 'Reason', value: reason, inline: false },
                { name: 'Total Warns', value: `${warnCount}`, inline: true },
                { name: 'Moderator', value: `<@${moderatorId}>`, inline: true }
            );

        await interaction.reply({ embeds: [warnEmbed] });

        // Try to DM the user
        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle('You have been warned')
                .setColor(color.warn)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription(`You have received a warning in **${interaction.guild.name}**.`)
                .addFields(
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: `<@${moderatorId}>`, inline: true },
                    { name: 'Total Warns', value: `${warnCount}`, inline: true }
                );
            
            await user.send({ embeds: [dmEmbed] });
        } catch (err) {
            // DMs closed
        }
    }
};
