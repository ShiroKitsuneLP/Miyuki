// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.resolve(__dirname, '../db'));

// Function to setup Error Logs table
async function setupErrorLogSchema() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS error_logs (
            id serial PRIMARY KEY,
            context text,
            category text,
            file text,
            error_message text NOT NULL,
            stack_trace text,
            timestamp timestamptz NOT NULL
        );
    `);

    console.log('[Database] error_logs table ready');
}

module.exports = { setupErrorLogSchema }