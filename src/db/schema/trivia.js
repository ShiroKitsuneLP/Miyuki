// Import the database connection
const db = require('./../database.js');

// Function to set up the trivia_questions table
function setupTriviaSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS trivia_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            question TEXT NOT NULL,
            answers TEXT NOT NULL, -- JSON-Array as string
            correct_index INTEGER NOT NULL
        );
    `);
    console.log('[DB] trivia_questions table ready');
}

module.exports = { setupTriviaSchema };