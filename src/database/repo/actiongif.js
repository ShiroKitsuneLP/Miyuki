// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Prepare statements
const insertActionGifStmt = db.prepare(`
    INSERT INTO action_gifs (action, url) 
    VALUES (@action, @url)
    ON CONFLICT(action, url) DO NOTHING;
`);

const listActionGifsStmt = db.prepare(`
    SELECT id, url 
    FROM action_gifs 
    WHERE action = @action
    ORDER BY id DESC
    LIMIT @limit OFFSET @offset;
`);

const listAllActionGifsStmt = db.prepare(`
    SELECT id, action, url 
    FROM action_gifs 
    ORDER BY id DESC
    LIMIT @limit OFFSET @offset;
`);

const listAllActionGifsNoLimitStmt = db.prepare(`
    SELECT id, action, url 
    FROM action_gifs 
    ORDER BY id DESC;
`);

const getRandomGifByActionStmt = db.prepare(`
    SELECT id, url 
    FROM action_gifs
    WHERE action = @action
    ORDER BY RANDOM()
    LIMIT 1;
`);

const deleteActionGifByIdStmt = db.prepare(`
    DELETE FROM action_gifs 
    WHERE id = @id;
`);

// Function to reload the action GIF cache
let gifCache = null;

function reloadCache() {
    gifCache = listAllGifsNoLimit();
}

// Function to add a new action GIF
function addGif(action, url) {
    const result = insertActionGifStmt.run({ action, url });
    reloadCache();
    return result;
}

// Function to list action GIFs by action with pagination
function listActionGifs(action, limit = 10, page = 1) {
    limit = Math.max(1, limit);
    page = Math.max(1, page);
    const offset = (page - 1) * limit;
    return listActionGifsStmt.all({ action, limit, offset });
}

// Function to list all action GIFs with pagination
function listAllGifs(limit = 10, page = 1) {
    limit = Math.max(1, limit);
    page = Math.max(1, page);
    const offset = (page - 1) * limit;
    return listAllActionGifsStmt.all({ limit, offset });
}

// Function to list all action GIFs without limit
function listAllGifsNoLimit() {
    return listAllActionGifsNoLimitStmt.all();
}

// Function to get a random GIF by action
function getRandomGif(action) {
    return getRandomGifByActionStmt.get({ action });
}

// Function to delete an action GIF by ID and reload cache
function removeById(id) {
    const changes = deleteActionGifByIdStmt.run({ id }).changes;
    reloadCache();
    return changes;
}

reloadCache();

module.exports = {
    addGif,
    listActionGifs,
    listAllGifs,
    getRandomGif,
    removeById
}