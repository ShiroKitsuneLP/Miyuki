// Import PG
const { Client } = require('pg');

// Import nessesary modules
const path = require('path');

// Import Config
const { dbClient } = require(path.resolve(__dirname, '../config/config.json'));

// Create Db Client
const db = new Client({
    user: dbClient.user,
    host: dbClient.host,
    database: dbClient.database,
    password: dbClient.password,
    port: dbClient.port
});

// Connect to DB
db.connect(error => {
    if (error) console.error('[Database] Connection error: ', error.stack);
});

module.exports = { db }