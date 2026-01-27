// Import necessary Discord.js classes
const { SlashCommandBuilder, ChannelType } = require('discord.js');

// Import necessary modules
const path = require('path');

// Import embedBuilder
const { createMiyukiEmbed } = require(path.join(__dirname, './../../utils/embedBuilder'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get information about the server'),
    category: 'Info',
    usage: '/serverinfo',
    async execute(interaction, miyuki) {

        // Guild information
        const guild = interaction.guild;

        // Get Guild Owner
        const owner = await miyuki.users.fetch(guild.ownerId);

        // Member information
        const totalMembers = guild.memberCount;
        const humanMembers = guild.members.cache.filter(member => !member.user.bot).size;
        const botMembers = guild.members.cache.filter(member => member.user.bot).size;

        // Channel information
        const totalChannels = guild.channels.cache.filter(c => c.type !== ChannelType.GuildCategory);
        const textChannels = totalChannels.filter(c => c.type === ChannelType.GuildText);
        const voiceChannels = totalChannels.filter(c => c.type === ChannelType.GuildVoice);

        // Role count
        const totalRoles = guild.roles.cache.filter(r => r.name !== '@everyone' && !r.managed);

        // Sticker and Emoji count
        const totalStickers = guild.stickers.cache.size;
        const totalEmojis = guild.emojis.cache.size;

        // Send the server info embed
        return interaction.reply({ embeds: [createMiyukiEmbed(miyuki, {
            title: `Server Info: ${guild.name}`,
            description: `Wanna see what this server is made of? \n Let’s take a peek!`,
            thumbnail: guild.iconURL({ dynamic: true }),
            fields: [
                // Server Info
                { name: '~~────────────~~ **Server Info** ~~────────────~~', value: '', inline: false },
                { name: 'Server Name', value: `${guild.name}`, inline: true },
                { name: 'Server ID', value: `${guild.id}`, inline: true },
                { name: '', value: '', inline: false },
                { name: 'Owner', value: `${owner.username}`, inline: true },
                { name: 'Created on', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },

                // Member Info
                { name: '~~────────────~~ **Members** ~~────────────~~', value: '', inline: false },
                { name: 'In Total', value: `${totalMembers}`, inline: true },
                { name: 'User', value: `${humanMembers}`, inline: true },
                { name: 'Bots', value: `${botMembers}`, inline: true },

                // Channel Info
                { name: '~~────────────~~ **Channels** ~~────────────~~', value: '', inline: false },
                { name: 'In Total', value: `${totalChannels.size}`, inline: true },
                { name: 'Text', value: `${textChannels.size}`, inline: true },
                { name: 'Voice', value: `${voiceChannels.size}`, inline: true },

                // Role Info
                { name: '~~────────────~~ **Roles** ~~────────────~~', value: '', inline: false },
                { name: 'User Roles', value: `${totalRoles.size}`, inline: false },

                // Sticker & Emoji Info
                { name: ' ~~─────────~~ **Sticker & Emojis** ~~─────────~~', value: '', inline: false },
                { name: 'Stickers', value: `${totalStickers}`, inline: true },
                { name: 'Emojis', value: `${totalEmojis}`, inline: true },
            ],
        image: guild.bannerURL({ size: 2048 }) || undefined
        })] });
    }
}