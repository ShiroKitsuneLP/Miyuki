// Import the database connection
const db = require('./../database.js');

// Prepared statement to insert a new GIF
const addGIF = db.prepare(`
    INSERT INTO action_gifs (action, url)
    VALUES (@action, @url)
    ON CONFLICT(action, url) DO NOTHING
`);

// Prepared statement to get a List of GIF URLs
const listGIFs = db.prepare(`
    SELECT id, url
    FROM action_gifs
    WHERE action = ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?
`);

// Preared statemant to get all GIF's
const listAllGIFs = db.prepare(`
    SELECT id, action, url
    FROM action_gifs
    ORDER BY id
    LIMIT ? OFFSET ?
`);

// Prepared statement to delete GIF with id
const deleteById = db.prepare(`
    DELETE FROM action_gifs
    WHERE id = ?
`);

// Prepared statement to get one random GIF url
const randomGIF = db.prepare(`
    SELECT id, url
    FROM action_gifs
    WHERE action = ?
    ORDER BY RANDOM()
    LIMIT 1
`);

module.exports = {

    // Add a GIF
    add(action, url) {
        addGIF.run({ action, url });
        reloadCache();
    },
    
    // Shows all GIFs
    list(action, limit = 10, page = 1) {
        const offset = Math.max(0, (page - 1) * limit);
        return listGIFs.all(action, limit, offset);
    },

    // Shows all GIFs
    listAll(limit = 10, page = 1) {
        const offset = Math.max(0, (page - 1) * limit);
        return listAllGIFs.all(limit, offset);
    },

    // Removed GIF url by ID
    removeById(id) {
        const changes = deleteById.run(id).changes;
        reloadCache();
        return changes;
    },

    // Get Random GIF
    getRandom(action) {
        return randomGIF.get(action) ?? null;
    }
}

// GIF Cache
let gifCache = null;

// Function to reload the GIF cache
function reloadCache() {
    gifCache = module.exports.listAll(1000, 1);
}