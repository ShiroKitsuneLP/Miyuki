// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Function to setup Error Logs table
function setupErrorLogSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS error_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            context TEXT,
            file TEXT,
            error_message TEXT NOT NULL,
            stack_trace TEXT,
            timestamp INTEGER NOT NULL
        );
    `);

    console.log('[Database] error_logs table ready');
}

module.exports = { setupErrorLogSchema }