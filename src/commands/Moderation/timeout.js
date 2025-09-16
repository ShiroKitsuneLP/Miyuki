// Import necessary classes from discord.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

// import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeouts a user for a specified duration.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes (1-10080)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10080))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    usage: '/timeout <user> <duration>',
    async execute(interaction, miyuki) {

        // Ensure the command is used in a guild
        if (!interaction.inGuild()) {
            return interaction.reply({ embeds: [errorEmbed('This command can only be used in a server.')], flags: MessageFlags.Ephemeral });
        }

        // Get command options
        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Check if user is Miyuki
        if (user.id === miyuki.user.id) {
            return interaction.reply({ content: 'You cannot timeout Miyuki.', ephemeral: true });
        }

        // Check if user is a bot
        if (user.bot) {
            return interaction.reply({ content: 'You cannot timeout a bot.', ephemeral: true });
        }

        try {
            const member = await interaction.guild.members.fetch(user.id);
            if (!member.moderatable) {
                return interaction.reply({ content: 'I cannot timeout this user. They may have a higher role than me or I lack the necessary permissions.', ephemeral: true });
            }
            await member.timeout(duration * 60 * 1000);

            const timeoutEmbed = new EmbedBuilder()
                .setColor(color.success)
                .setTitle('User Timed Out')
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription(`Successfully timed out ${user.tag} `)
                .addFields(
                    { name: 'Duration', value: `${duration} minutes`, inline: true },
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true }
                );

            await interaction.reply({ embeds: [timeoutEmbed] });

            // Try to DM the user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('You have been timed out')
                    .setColor(color.warn)
                    .setAuthor({
                        name: miyuki.user.username,
                        iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                    })
                    .setDescription(`You have been timed out in **${interaction.guild.name}**`)
                    .addFields(
                        { name: 'Duration', value: `${duration} minutes`, inline: true },
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true }
                    );

                await user.send({ embeds: [dmEmbed] });
            } catch (err) {
                // DMs closed
            }
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'An error occurred while trying to timeout the user.', ephemeral: true });
        }
    }
};