// Import necessary modules
const path = require('path');

// Import database connection
const { db } = require(path.join(__dirname, './../db'));

// Prepare statements
const insertErrorLog = db.prepare(`
    INSERT INTO error_logs (guild_id, user_id, command, context, error_message, stack_trace, timestamp)
    VALUES (@guild_id, @user_id, @command, @context, @error_message, @stack_trace, @timestamp)
`);

const listErrorLogsStmt = db.prepare(`
    SELECT * FROM error_logs
    ORDER BY timestamp DESC
    LIMIT @limit OFFSET @offset;
`);

const getErrorLogByIdStmt = db.prepare(`
    SELECT * FROM error_logs
    WHERE id = @id;
`);

const removeErrorLogByIdStmt = db.prepare(`
    DELETE FROM error_logs
    WHERE id = @id;
`);

const clearErrorLogsStmt = db.prepare(`
    DELETE FROM error_logs;
`);

// Function to log an error
function logError(guildId, userId, command, context, errorMessage, stackTrace) {
    insertErrorLog.run({
        guild_id: guildId,
        user_id: userId,
        command: command,
        context: context,
        error_message: errorMessage,
        stack_trace: stackTrace,
        timestamp: Date.now()
    });
}

// Function to list error logs with pagination
function listErrorLogs(limit = 50, offset = 0) {
    return listErrorLogsStmt.all({ limit, offset });
}

// Function to get a specific error log by ID
function getErrorLogById(id) {
    return getErrorLogByIdStmt.get({ id });
}

function removeErrorLogById(id) {
    return removeErrorLogByIdStmt.run({ id });
}

function clearErrorLogs() {
    return clearErrorLogsStmt.run();
}

module.exports = {
    logError,
    listErrorLogs,
    getErrorLogById,
    removeErrorLogById,
    clearErrorLogs
}