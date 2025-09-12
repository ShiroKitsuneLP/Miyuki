// Import necessary classes from discord.js
const { Events, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');

// Import welcome repository
const { welcome } = require('../../db/repo');

// Function to replace placeholders in the welcome message
function replacePlaceholders(str, member) {
    if (!str) return "";
    return String(str)
    .replaceAll('{user}', `<@${member.id}>`)
    .replaceAll('{username}', member.user.username)
    .replaceAll('{guild}', member.guild.name);
}

function isAvatarToken(v) {
    if (!v) return false;
    const x = String(v).toLowerCase().trim();
    return x === 'user' || x === '{user}' || x === 'avatar' || x === '{avatar}';
}

function isValidUrl(v) {
    try { 
        new URL(v); 
        return true; 
    } catch { 
        return false; 

    }
}

// Function to build an embed from the configuration
function buildEmbedFromConfig(cfg, member) {
    const welcomeEmbed = new EmbedBuilder();

    // Set Embed Title
    if (cfg.embed_title) {
        welcomeEmbed.setTitle(replacePlaceholders(cfg.embed_title, member));
    }

    // Set Embed Description
    if (cfg.embed_description) {
        welcomeEmbed.setDescription(replacePlaceholders(cfg.embed_description, member));
    }

    // Set Embed Color
    if (cfg.embed_color) {
        welcomeEmbed.setColor(cfg.embed_color);
    }

    const avatarUrl = member.user.displayAvatarURL({ dynamic: true, size: 2048 });

    // Set Embed Thumbnail
    if (cfg.embed_thumbnail_url) {
        const val = cfg.embed_thumbnail_url;
        if (isAvatarToken(val)) {
            welcomeEmbed.setThumbnail(avatarUrl);
        } else if (isValidUrl(val)) {
            welcomeEmbed.setThumbnail(val);
        }
    }

    // Set Embed Image
    if (cfg.embed_image_url) {
        const val = embed_image_url;
        if (isAvatarToken(val)) {
            welcomeEmbed.setImage(avatarUrl);
        } else if (isValidUrl(val)) {
            welcomeEmbed.setImage(val);
        }
    }

    // Set Embed Footer
    if (cfg.embed_footer) {
        welcomeEmbed.setFooter({ text: replacePlaceholders(cfg.embed_footer, member) });
    }

    // Set Embed Timestamp
    if (cfg.embed_timestamp) {
        welcomeEmbed.setTimestamp(new Date());
    }

    // Failback
    if(!cfg.embed_title && !cfg.embed_description) {
        welcomeEmbed.setDescription(`${member} joined ${member.guild.name}!`);
    }

    return welcomeEmbed;
}

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member, miyuki) {
        try {
            const cfg = welcome.getConfig(member.guild.id);
            if (!cfg) return;
            if (!cfg.enabled) return;
            if (!cfg.channel_id) return;

            // Fetch the channel
            const channel = member.guild.channels.cache.get(cfg.channel_id) ?? await member.guild.channels.fetch(cfg.channel_id).catch(() => null);

            if (!channel || channel.type !== ChannelType.GuildText) return;

            // Check bot permissions in the channel
            const me = member.guild.members.me ?? await member.guild.member.fetchMe();
            const perms = channel.permissionsFor(me);

            if (!perms.has(PermissionsBitField.Flags.ViewChannel) || !perms.has(PermissionsBitField.Flags.SendMessages)) {
                return;
            }

            if (cfg.mode === 'embed' && !perms.has(PermissionsBitField.Flags.EmbedLinks)) {
                return;
            }

            // Prepare the welcome message
            let content = null;
            let embeds = undefined;

            if (cfg.mode === 'embed') {
                const embed = buildEmbedFromConfig(cfg, member);
                embeds = [embed]

                if (cfg.ping_user) {
                    content = `<@${member.id}>`
                }

            } else {
                const text = replacePlaceholders(cfg.text_content || '', member).trim();
                if(!text) return;

                content = cfg.ping_user ? `<@${member.id}> ${text}` : text;
            }

            await channel.send({ content: content || undefined, embeds })
        } catch (err) {
            console.error('[welcome] Failed to send welcome message:', err);
        }
    }
}