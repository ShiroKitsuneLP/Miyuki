// Import necessary classes from discord.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

// import color configuration
const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    usage: '/ban <target> [reason]',
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
            return interaction.reply({ content: 'You cannot ban Miyuki.', ephemeral: true });
        }

        // Check if user is a bot
        if (target.bot) {
            return interaction.reply({ content: 'You cannot ban a bot.', ephemeral: true });
        }

        try {
            const member = await interaction.guild.members.fetch(target.id);
            if (!member.bannable) {
                return interaction.reply({ content: 'I cannot ban this user. They may have a higher role than me or I lack the necessary permissions.', ephemeral: true });
            }
            await member.ban(reason);
            
            const banEmbed = new EmbedBuilder()
                .setColor(color.success)
                .setTitle('User Banned')
                .setAuthor({
                    name: miyuki.user.username,
                    iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                })
                .setDescription(`Successfully banned ${target.tag} for: ${reason}`);

            await interaction.reply({ embeds: [banEmbed] });

            // Try to DM the user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('You have been banned')
                    .setColor(color.warn)
                    .setAuthor({
                        name: miyuki.user.username,
                        iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
                    })
                    .setDescription(`You have been banned from **${interaction.guild.name}**.`)
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
            await interaction.reply({ content: 'An error occurred while trying to ban the user.', ephemeral: true });
        }
    }
}