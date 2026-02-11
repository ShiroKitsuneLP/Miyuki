// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.resolve(__dirname, '../db'));

// Function to add a new Action GIF
async function addActionGif(action, url) {
    const res = await db.query(
        `INSERT INTO action_gifs (action, url)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING id;`,
        [action, url]
    );
    return res.rowCount > 0;
}

async function listActionGifs(action, limit, offset) {
    const res = await db.query(
        `SELECT id, url FROM action_gifs
        WHERE action = $1
        ORDER BY id DESC
        LIMIT $2 OFFSET $3;`,
        [action, limit, offset]
    );
    return res.rows;
}

async function listAllActionGifs(limit, offset) {
    const res = await db.query(
        `SELECT * FROM action_gifs
        ORDER BY id DESC
        LIMIT $1 OFFSET $2;`,
        [limit, offset]
    );
    return res.rows;
}

async function getGifById(id) {
    const res = await db.query(
        `SELECT * FROM action_gifs
        WHERE id = $1;`,
        [id]
    );
    return res.rows[0];
}

async function getRandomGifByAction(action) {
    const res = await db.query(
        `SELECT id, url FROM action_gifs
        WHERE action = $1
        ORDER BY Random()
        LIMIT 1;`,
        [action]
    );
    return res.rows[0];
}

async function removeActionGifById(id) {
    const res = await db.query(
        `DELETE FROM action_gifs
        WHERE id = $1;`,
        [id]
    );
    return res.rowCount > 0;
}

module.exports = {
    addActionGif,
    listActionGifs,
    listAllActionGifs,
    getGifById,
    getRandomGifByAction,
    removeActionGifById
}