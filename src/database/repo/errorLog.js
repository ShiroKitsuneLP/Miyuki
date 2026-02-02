// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.resolve(__dirname, '../db'));

// Function to Check if this Error is already in Database
async function existsErrorLog(context, file, errorMessage, stackTrace) {
    const res = await db.query(
        `SELECT 1 FROM error_logs
        WHERE context = $1 AND file = $2 AND error_message = $3 AND stack_trace = $4
        LIMIT 1;`,
        [context, file, errorMessage, stackTrace]
    );
    return res.rowCount > 0;
}

// Function to Insert ErrorLog in Database
async function insertErrorLog(context, file, errorMessage, stackTrace, timestamp) {

    // Check if this Error is already in Database 
    if (!(await existsErrorLog(context, file, errorMessage, stackTrace))) {
        await db.query(
            `INSERT INTO error_logs (context, file, error_message, stack_trace, timestamp)
            VALUES ($1, $2, $3, $4, $5);`,
            [context, file, errorMessage, stackTrace, timestamp]
        );
    }
}

// Function to List all ErrorLogs
async function listErrorLogs(limit, offset) {
    const res = await db.query(
        `SELECT * FROM error_logs
        ORDER BY id
        LIMIT $1 OFFSET $2;`,
        [limit, offset]
    );
    return res.rows;
}

// Function to get ErrorLog by ID
async function getErrorLogById(id) {
    const res = await db.query(
        `SELECT * FROM error_logs
        WHERE id = $1;`,
        [id]
    );
    return res.rows[0];
}

// Function to Rremove ErrorLog by ID
async function removeErrorLogById(id) {
    const result = await db.query(
        `DELETE FROM error_logs
        WHERE id = $1;`,
        [id]
    );
    return result;
}

// Function to Clear all ErrorLogs in Database
async function clearErrorLogs() {
    await db.query(`DELETE FROM error_logs;`);
}

module.exports = {
    insertErrorLog,
    listErrorLogs,
    getErrorLogById,
    removeErrorLogById,
    clearErrorLogs
}