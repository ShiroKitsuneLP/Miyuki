// Import necessary classes from discord.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

// Import the warn repository
const { warn } = require('../../db/repo');

// Import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Shows all warnings for a user or all warned users.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to check')
                .setRequired(false))
        .addIntegerOption(option => 
            option.setName('page')
                .setDescription('Page number for all warned users')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    usage: '/warnings [user] [page]',
    async execute(interaction, miyuki) {

        // Ensure the command is used in a guild
        if (!interaction.inGuild()) {
            return interaction.reply({ embeds: [errorEmbed('This command can only be used in a server.')], flags: MessageFlags.Ephemeral });
        }

        // Get command options
        const user = interaction.options.getUser('user');
        const page = interaction.options.getInteger('page') || 1;
        const guildId = interaction.guild.id;
        const perPage = 15;

        if (user) {

            // Show all warnings for a specific user
            const warns = warn.getAll(guildId, user.id);

            if (!warns.length) {
                const noWarnEmbed = new EmbedBuilder()
                    .setTitle('No Warnings Found')
                    .setColor(color.default)
                    .setAuthor({
                        name: miyuki.user.username,
                        iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                    })
                    .setDescription(`${user} has no warnings.`);
                return await interaction.reply({ embeds: [noWarnEmbed] });
            }
            const embed = new EmbedBuilder()
                .setTitle(`Warnings for ${user.tag}`)
                .setColor(color.default)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription(warns.map((w, i) =>
                    `**${i + 1}.** ${new Date(w.timestamp).toLocaleString()} by <@${w.moderator_id}>: ${w.reason}`
                ).join('\n'));

            await interaction.reply({ embeds: [embed] });
        } else {

            // Show all warned users (paginated)
            const allWarns = warn.getWarnCountsForGuild(guildId);

            if (!allWarns.length) {
                const noWarnedUsersEmbed = new EmbedBuilder()
                    .setTitle('No Warned Users')
                    .setColor(color.default)
                    .setAuthor({
                        name: miyuki.user.username,
                        iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                    })
                    .setDescription('No users with warnings found.');
                return await interaction.reply({ embeds: [noWarnedUsersEmbed] });
            }
            const totalPages = Math.ceil(allWarns.length / perPage);
            const pageWarns = allWarns.slice((page - 1) * perPage, page * perPage);

            const embed = new EmbedBuilder()
                .setTitle(`Warned Users (Page ${page}/${totalPages})`)
                .setColor(color.default)
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription(
                    pageWarns.map(w => `<@${w.user_id}> — ${w.count} Warn(s)`).join('\n')
                );

            await interaction.reply({ embeds: [embed] });
        }
    }
};
