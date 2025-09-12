// Import the database connection
const db = require('./../database.js');

// Prepared statement to get a guild's configuration
const getCfg = db.prepare(`SELECT * FROM welcome_messages WHERE guild_id = ?`);

// Prepared statement to insert or update a guild's configuration
const setCfg = db.prepare(`
    INSERT INTO welcome_messages (
        guild_id, enabled, channel_id, mode, 
        text_content,
        embed_title, embed_description, embed_color, embed_thumbnail_url, embed_image_url, embed_footer, embed_timestamp,
        ping_user
    ) VALUES (
        @guild_id, COALESCE(@enabled, 0), @channel_id, COALESCE(@mode, 'text'),
        @text_content,
        @embed_title, @embed_description, @embed_color, @embed_thumbnail_url, @embed_image_url, @embed_footer, COALESCE(@embed_timestamp, 0),
        COALESCE(@ping_user, 0)
    )
    ON CONFLICT(guild_id) DO UPDATE SET
        enabled = COALESCE(excluded.enabled, welcome_messages.enabled),
        channel_id = COALESCE(excluded.channel_id, welcome_messages.channel_id),
        mode = COALESCE(excluded.mode, welcome_messages.mode),
        text_content = COALESCE(excluded.text_content, welcome_messages.text_content),
        embed_title = COALESCE(excluded.embed_title, welcome_messages.embed_title),
        embed_description = COALESCE(excluded.embed_description, welcome_messages.embed_description),
        embed_color = COALESCE(excluded.embed_color, welcome_messages.embed_color),
        embed_thumbnail_url = COALESCE(excluded.embed_thumbnail_url, welcome_messages.embed_thumbnail_url),
        embed_image_url = COALESCE(excluded.embed_image_url, welcome_messages.embed_image_url),
        embed_footer = COALESCE(excluded.embed_footer, welcome_messages.embed_footer),
        embed_timestamp = COALESCE(excluded.embed_timestamp, welcome_messages.embed_timestamp),
        ping_user = COALESCE(excluded.ping_user, welcome_messages.ping_user)
`);

// Prepared statement to enable/disable welcome messages
const setEnabled = db.prepare(`UPDATE welcome_messages SET enabled = ? WHERE guild_id = ?`);

// Prepared statement to delete a guild's configuration
const clearCfg = db.prepare(`DELETE FROM welcome_messages WHERE guild_id = ?`);

// Default configuration values
const defaults = {
    enabled: 0,
    channel_id: null,
    mode: 'text',
    text_content: null,
    embed_title: null,
    embed_description: null,
    embed_color: null,
    embed_thumbnail_url: null,
    embed_image_url: null,
    embed_footer: null,
    embed_timestamp: 0,
    ping_user: 0
}

module.exports = {

    // Get the welcome configuration for a guild
    getConfig(guildId) {
        return getCfg.get(guildId) ?? null;
    },

    // Set or update the welcome configuration for a guild
    setConfig(guildId, cfg = {}) {
        setCfg.run({ guild_id: guildId, ...defaults, ...cfg });
    },

    // Enable or disable welcome messages for a guild
    enable(guildId, on = true) {
       const row = getCfg.get(guildId);
       if (row) {
           setEnabled.run(on ? 1 : 0, guildId);
       } else {
           setCfg.run({ guild_id: guildId, ...defaults, enabled: on ? 1 : 0 });
       }
    },

    // Clear the welcome configuration for a guild
    clear(guildId) {
        clearCfg.run(guildId);
    },

    // Set the channel ID for welcome messages
    setChannel(guildId, channelId) {
        this.setConfig(guildId, { channel_id: channelId });
    },

    // Set welcome message as text
    setText(guildId, content, { ping_user } = {}) {
        this.setConfig(guildId, {

            // Clear embed fields
            embed_title: null,
            embed_description: null,
            embed_color: null,
            embed_thumbnail_url: null,
            embed_image_url: null,
            embed_footer: null,
            embed_timestamp: 0,

            mode: 'text',
            text_content: content,
            ...(typeof ping_user === 'boolean' ? { ping_user: ping_user ? 1 : 0 } : {})
        });
    },

    // Set welcome message as embed
    setEmbed(guildId, fields = {}) {
        const {
            title, description, color, thumbnail_url, image_url, footer, 
            timestamp, // boolean => 1/0
            ping_user // boolean => 1/0
        } = fields;

        this.setConfig(guildId, {
            
            // Clear text field
            text_content: null,

            mode: 'embed',
            embed_title: title ?? null,
            embed_description: description ?? null,
            embed_color: color ?? null,
            embed_thumbnail_url: thumbnail_url ?? null,
            embed_image_url: image_url ?? null,
            embed_footer: footer ?? null,
            ...(typeof timestamp === 'boolean' ? { embed_timestamp: timestamp ? 1 : 0 } : {}),
            ...(typeof ping_user === 'boolean' ? { ping_user: ping_user ? 1 : 0 } : {})
        });
    }
}
