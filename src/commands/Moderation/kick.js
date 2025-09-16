// Import necessary classes from discord.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

// import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the kick')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    usage: '/kick <target> [reason]',
    async execute(interaction, miyuki) {

        // Ensure the command is used in a guild
        if (!interaction.inGuild()) {
            return interaction.reply({ embeds: [errorEmbed('This command can only be used in a server.')], flags: MessageFlags.Ephemeral });
        }

        // Get command options
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Ceck if user is miyuki
        if (target.id === miyuki.user.id) {
            return interaction.reply({ content: 'You cannot kick Miyuki.', ephemeral: true });
        }

        // Check if user is a bot
        if (target.bot) {
            return interaction.reply({ content: 'You cannot kick a bot.', ephemeral: true });
        }

        try {
            const member = await interaction.guild.members.fetch(target.id);
            if (!member.kickable) {
                return interaction.reply({ content: 'I cannot kick this user. They may have a higher role than me or I lack the necessary permissions.', ephemeral: true });
            }
            await member.kick(reason);

            const kickEmbed = new EmbedBuilder()
                .setColor(color.success)
                .setTitle('User Kicked')
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription(`Successfully kicked ${target.tag} for: ${reason}`);

            await interaction.reply({ embeds: [kickEmbed] });

            // Try to DM the user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('You have been kicked')
                    .setColor(color.warn)
                    .setAuthor({
                        name: miyuki.user.username,
                        iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                    })
                    .setDescription(`You have been kicked from **${interaction.guild.name}**`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true }
                    );
                    
               await target.send({ embeds: [dmEmbed] });
            } catch (err) {
                // DMs closed
            }
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'An error occurred while trying to kick the user.', ephemeral: true });
        }
    }
};