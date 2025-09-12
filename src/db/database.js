// Import nested modules
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Define the path to the SQLite database file
const dbPath = path.join(dataDir, 'miyukiDB.db');

// check if the database file exists, if not it will be created
if (fs.existsSync(dbPath)) {
    console.log(`Database file found at: \n${dbPath}`);
} else {
    console.log(`Database file not found. Creating new database at: \n${dbPath}`);
}


// Initialize the database connection
const db = new Database(dbPath);

// Set pragmas for performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

module.exports = db;
