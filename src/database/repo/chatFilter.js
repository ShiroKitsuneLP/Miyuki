// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Prepare statements
const insertBadLinkStmt = db.prepare(`
    INSERT INTO chatfilter_badlinks (bad_link) 
    VALUES (@bad_link)
    ON CONFLICT(bad_link) DO NOTHING;
`);

const listBadLinksStmt = db.prepare(`
    SELECT id, bad_link 
    FROM chatfilter_badlinks 
    ORDER BY id DESC
    LIMIT @limit OFFSET @offset;
`);

const listAllBadLinksStmt = db.prepare(`
    SELECT id, bad_link 
    FROM chatfilter_badlinks 
    ORDER BY id DESC;
`);

const getBadLinkByIdStmt = db.prepare(`
    SELECT id, bad_link 
    FROM chatfilter_badlinks 
    WHERE id = @id;
`);

const getBadLinkByUrlStmt = db.prepare(`
    SELECT id, bad_link 
    FROM chatfilter_badlinks 
    WHERE bad_link = @bad_link;
`);

const removeBadLinkByIdStmt = db.prepare(`
    DELETE FROM chatfilter_badlinks 
    WHERE id = @id;
`);

const removeBadLinkByUrlStmt = db.prepare(`
    DELETE FROM chatfilter_badlinks 
    WHERE bad_link = @bad_link;
`);

const insertNsfwLinkStmt = db.prepare(`
    INSERT INTO chatfilter_nsfwlinks (nsfw_link) 
    VALUES (@nsfw_link)
    ON CONFLICT(nsfw_link) DO NOTHING;
`);

const listNsfwLinksStmt = db.prepare(`
    SELECT id, nsfw_link 
    FROM chatfilter_nsfwlinks 
    ORDER BY id DESC
    LIMIT @limit OFFSET @offset;
`);

const listAllNsfwLinksStmt = db.prepare(`
    SELECT id, nsfw_link 
    FROM chatfilter_nsfwlinks 
    ORDER BY id DESC;
`);

const getNsfwLinkByIdStmt = db.prepare(`
    SELECT id, nsfw_link 
    FROM chatfilter_nsfwlinks 
    WHERE id = @id;
`);

const getNsfwLinkByUrlStmt = db.prepare(`
    SELECT id, nsfw_link 
    FROM chatfilter_nsfwlinks 
    WHERE nsfw_link = @nsfw_link;
`);

const removeNsfwLinkByIdStmt = db.prepare(`
    DELETE FROM chatfilter_nsfwlinks 
    WHERE id = @id;
`);

const removeNsfwLinkByUrlStmt = db.prepare(`
    DELETE FROM chatfilter_nsfwlinks 
    WHERE nsfw_link = @nsfw_link;
`);

const setChatFilterSettingsStmt = db.prepare(`
    INSERT INTO chatfilter_settings (guild_id, bad_links_toggle, nsfw_links_toggle, auto_warn) 
    VALUES (@guild_id, @bad_links_toggle, @nsfw_links_toggle, @auto_warn)
    ON CONFLICT(guild_id) DO UPDATE SET 
        bad_links_toggle = @bad_links_toggle,
        nsfw_links_toggle = @nsfw_links_toggle,
        auto_warn = @auto_warn;
`);

const getChatFilterSettingsStmt = db.prepare(`
    SELECT * FROM chatfilter_settings 
    WHERE guild_id = @guild_id;
`);

const removeGuildSettingsStmt = db.prepare(`
    DELETE FROM chatfilter_settings 
    WHERE guild_id = @guild_id;
`);

const addIgnoredChannelStmt = db.prepare(`
    INSERT INTO chatfilter_ignored_channels (guild_id, channel_id) 
    VALUES (@guild_id, @channel_id)
    ON CONFLICT(guild_id, channel_id) DO NOTHING;
`);

const listIgnoredChannelsStmt = db.prepare(`
    SELECT channel_id FROM chatfilter_ignored_channels 
    WHERE guild_id = @guild_id;
`);

const getIgnoredChannelsStmt = db.prepare(`
    SELECT channel_id FROM chatfilter_ignored_channels 
    WHERE guild_id = @guild_id;
`);

const removeIgnoredChannelStmt = db.prepare(`
    DELETE FROM chatfilter_ignored_channels 
    WHERE guild_id = @guild_id AND channel_id = @channel_id;
`);

const addIgnoredRoleStmt = db.prepare(`
    INSERT INTO chatfilter_ignored_roles (guild_id, role_id) 
    VALUES (@guild_id, @role_id)
    ON CONFLICT(guild_id, role_id) DO NOTHING;
`);

const listIgnoredRolesStmt = db.prepare(`
    SELECT role_id FROM chatfilter_ignored_roles 
    WHERE guild_id = @guild_id;
`);

const getIgnoredRolesStmt = db.prepare(`
    SELECT role_id FROM chatfilter_ignored_roles 
    WHERE guild_id = @guild_id;
`);

const removeIgnoredRoleStmt = db.prepare(`
    DELETE FROM chatfilter_ignored_roles 
    WHERE guild_id = @guild_id AND role_id = @role_id;
`);

// Function to reload caches
let badLinkCache = null;
let nsfwLinkCache = null;

function reloadBadLinkCache() {
    badLinkCache = listAllBadLinks();
}

function reloadNsfwLinkCache() {
    nsfwLinkCache = listAllNsfwLinks();
}

// Function to add a new bad link
function addBadLink(bad_link) {
    const result = insertBadLinkStmt.run({ bad_link });
    reloadBadLinkCache();
    return result;
}

// Function to list bad links with pagination
function listBadLinks(limit = 10, offset = 0) {
    return listBadLinksStmt.all({ limit, offset });
}

// Function to list all bad links
function listAllBadLinks() {
    return listAllBadLinksStmt.all();
}

// Function to get a bad link by ID
function getBadLinkById(id) {
    return getBadLinkByIdStmt.get({ id });
}

// Function to get a bad link by URL
function getBadLinkByUrl(bad_link) {
    return getBadLinkByUrlStmt.get({ bad_link });
}

// Function to remove a bad link by ID and reload cache
function removeBadLinkById(id) {
    const changes = removeBadLinkByIdStmt.run({ id }).changes;
    reloadBadLinkCache();
    return changes;
}

// Function to remove a bad link by URL and reload cache
function removeBadLinkByUrl(bad_link) {
    const changes = removeBadLinkByUrlStmt.run({ bad_link }).changes;
    reloadBadLinkCache();
    return changes;
}

// Function to add a new NSFW link
function addNsfwLink(nsfw_link) {
    const result = insertNsfwLinkStmt.run({ nsfw_link });
    reloadNsfwLinkCache();
    return result;
}

// Function to list NSFW links with pagination
function listNsfwLinks(limit = 10, offset = 0) {
    return listNsfwLinksStmt.all({ limit, offset });
}

// Function to list all NSFW links
function listAllNsfwLinks() {
    return listAllNsfwLinksStmt.all();
}

// Function to get a NSFW link by ID
function getNsfwLinkById(id) {
    return getNsfwLinkByIdStmt.get({ id });
}

// Function to get a NSFW link by URL
function getNsfwLinkByUrl(nsfw_link) {
    return getNsfwLinkByUrlStmt.get({ nsfw_link });
}

// Function to remove a NSFW link by ID and reload cache
function removeNsfwLinkById(id) {
    const changes = removeNsfwLinkByIdStmt.run({ id }).changes;
    reloadNsfwLinkCache();
    return changes;
}

// Function to remove a NSFW link by URL and reload cache
function removeNsfwLinkByUrl(nsfw_link) {
    const changes = removeNsfwLinkByUrlStmt.run({ nsfw_link }).changes;
    reloadNsfwLinkCache();
    return changes;
}

// Function to set chat filter settings for a guild
function setChatFilterSettings(guild_id, bad_links_toggle = 0, nsfw_links_toggle = 0, auto_warn = 0) {
    return setChatFilterSettingsStmt.run({ guild_id, bad_links_toggle, nsfw_links_toggle, auto_warn });
}

// Function to get chat filter settings for a guild
function getChatFilterSettings(guild_id) {
    return getChatFilterSettingsStmt.get({ guild_id });
}

// Function to remove chat filter settings for a guild
function removeGuildSettings(guild_id) {
    return removeGuildSettingsStmt.run({ guild_id });
}

// Function to add an ignored channel for a guild
function addIgnoredChannel(guild_id, channel_id) {
    return addIgnoredChannelStmt.run({ guild_id, channel_id });
}

// Function to list ignored channels for a guild
function listIgnoredChannels(guild_id) {
    return listIgnoredChannelsStmt.all({ guild_id });
}

// Function to get ignored channels for a guild
function getIgnoredChannels(guild_id) {
    return getIgnoredChannelsStmt.all({ guild_id });
}

// Function to remove an ignored channel for a guild
function removeIgnoredChannel(guild_id, channel_id) {
    return removeIgnoredChannelStmt.run({ guild_id, channel_id });
}

// Function to add an ignored role for a guild
function addIgnoredRole(guild_id, role_id) {
    return addIgnoredRoleStmt.run({ guild_id, role_id });
}

// Function to list ignored roles for a guild
function listIgnoredRoles(guild_id) {
    return listIgnoredRolesStmt.all({ guild_id });
}

// Function to get ignored roles for a guild
function getIgnoredRoles(guild_id) {
    return getIgnoredRolesStmt.all({ guild_id });
}

// Function to remove an ignored role for a guild
function removeIgnoredRole(guild_id, role_id) {
    return removeIgnoredRoleStmt.run({ guild_id, role_id });
}

reloadBadLinkCache();
reloadNsfwLinkCache();

module.exports = {
    addBadLink,
    listBadLinks,
    listAllBadLinks,
    getBadLinkById,
    getBadLinkByUrl,
    removeBadLinkById,
    removeBadLinkByUrl,
    addNsfwLink,
    listNsfwLinks,
    listAllNsfwLinks,
    getNsfwLinkById,
    getNsfwLinkByUrl,
    removeNsfwLinkById,
    removeNsfwLinkByUrl,
    setChatFilterSettings,
    getChatFilterSettings,
    removeGuildSettings,
    addIgnoredChannel,
    listIgnoredChannels,
    getIgnoredChannels,
    removeIgnoredChannel,
    addIgnoredRole,
    listIgnoredRoles,
    getIgnoredRoles,
    removeIgnoredRole,

    badLinkCache,
    nsfwLinkCache
}