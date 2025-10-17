// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Function to setup Error Logs table
function setupErrorLogSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS error_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            user_id TEXT,
            command TEXT,
            context TEXT,
            error_message TEXT NOT NULL,
            stack_trace TEXT,
            timestamp INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_error_logs_guild_id ON error_logs(guild_id);
        CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
    `);
    console.log('[Database] error_logs table ready');
}

module.exports = { setupErrorLogSchema }