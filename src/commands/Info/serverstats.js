const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

const { color } = require('./../../config/color.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverstats')
        .setDescription('Information about the Server'),
    usage: '/serverstats',
    async execute(interaction, miyuki) {

        // Guild
        const guild = interaction.guild;

        // Owner
        const owner = await miyuki.users.fetch(guild.ownerId);

        // Members
        const members = await guild.members.fetch();
        const user = members.filter(m => !m.user.bot);
        const bots = members.filter(m => m.user.bot);

        // Channels
        const channels = guild.channels.cache.filter(c => c.type !== ChannelType.GuildCategory);
        const textChannels = channels.filter(c => c.type === ChannelType.GuildText);
        const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice);

        // Roles
        const userRoles = guild.roles.cache.filter(role => role.name !== '@everyone' && !role.managed);

        const serverstatsEmbed = new EmbedBuilder()
            .setColor(color.default)
            .setTitle(`Stats from ${interaction.guild.name}`)
            .setAuthor({
                name: miyuki.user.username,
                iconURL: miyuki.user.displayAvatarURL({ dynamic: true, size: 2048 })
            })
            .setDescription('Wanna see what this server is made of? \n Let’s take a peek!')
            .setThumbnail(guild.iconURL({ dynamic: true, size: 2048 }))
            .addFields(
                { name: '**Owner**', value: `${owner.username}`, inline: false },

                { name: '**Created on**', value: guild.createdAt.toLocaleDateString('de-DE'), inline: false },

                { name: '~~────────────~~ **Members** ~~────────────~~', value: '', inline: false },
                { name: 'In Total', value: `${members.size}`, inline: true },
                { name: 'User', value: `${user.size}`, inline: true },
                { name: 'Bots', value: `${bots.size}`, inline: true },

                { name: '~~────────────~~ **Channels** ~~────────────~~', value: '', inline: false },
                { name: 'In Total', value: `${channels.size}`, inline: true },
                { name: 'Text', value: `${textChannels.size}`, inline: true },
                { name: 'Voice', value: `${voiceChannels.size}`, inline: true },

                { name: '~~────────────~~ **Booster** ~~────────────~~', value: '', inline: false },
                { name: 'Tier', value: `${guild.premiumTier}`, inline: true },
                { name: 'Boost Count', value: `${guild.premiumSubscriptionCount}`, inline: true },

                { name: '~~─────────────~~ **Roles** ~~─────────────~~', value: '', inline: false },
                { name: 'User Roles', value: `${userRoles.size}`, inline: true },
                { name: '\u200B', value: '\u200B', inline: true },

                { name: ' ~~─────────~~ **Sticker & Emojis** ~~─────────~~', value: '', inline: false },
                { name: 'Sticker', value: `${guild.stickers.cache.size}`, inline: true },
                { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true },
            );

        await interaction.reply({ embeds: [serverstatsEmbed] });
    }
}