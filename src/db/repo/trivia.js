// Import the database connection
const db = require('./../database.js');

// Prepared statements to insert a new trivia question
const addQuestion = db.prepare(`
    INSERT INTO trivia_questions (category, question, answers, correct_index)
    VALUES (@category, @question, @answers, @correct_index)
`);

// Prepared statement to get a List of all trivia questions
const listQuestions = db.prepare(`
    SELECT id, category, question, answers, correct_index
    FROM trivia_questions
    WHERE category = ? OR ? IS NULL
    ORDER BY id
    LIMIT ? OFFSET ?
`);

// Prepared statement to get a trivia question by id
const getById = db.prepare(`
    SELECT * FROM trivia_questions WHERE id = ?
`);

// Prepared statement to update a trivia question by id
const updateQuestion = db.prepare(`
    UPDATE trivia_questions
    SET category = @category,
        question = @question,
        answers = @answers,
        correct_index = @correct_index
    WHERE id = @id
`);

// Prepared statement to delete a trivia question by id
const deleteById = db.prepare(`
    DELETE FROM trivia_questions
    WHERE id = ?
`);

// Prepared statement to get one random trivia question
const randomQuestion = db.prepare(`
    SELECT * FROM trivia_questions
    WHERE category = ? OR ? IS NULL
    ORDER BY RANDOM()
    LIMIT 1
`);

module.exports = {

    // Add a trivia question
    add(category, question, answers, correctIndex) {

        // Ensure answers is a JSON string
        if (Array.isArray(answers)) {
            answers = JSON.stringify(answers);
        }
        addQuestion.run({ category, question, answers, correct_index: correctIndex });
        reloadCache();
    },

    // Shows all trivia questions in a category (or all if category is null)
    list(category = null, limit = 10, page = 1) {
        const offset = Math.max(0, (page - 1) * limit);
        const rows = listQuestions.all(category, category, limit, offset);

        // Antworten parsen
        return rows.map(row => {
            row.answers = JSON.parse(row.answers);
            return row;
        });
    },

    // Show trivia question by ID
    showById(id) {
        const row = getById.get(id);
        if (!row) return null;
        row.answers = JSON.parse(row.answers);
        return row;
    },

    // Update trivia question by ID
    update(cfg = {}) {
        if (!cfg.id) return null;
        cfg.answers = JSON.stringify(cfg.answers);
        const result = updateQuestion.run(cfg);
        reloadCache();
        return result;
    },

    // Removed trivia question by ID
    removeById(id) {
        const changes = deleteById.run(id).changes;
        reloadCache();
        return changes;
    },

    // Get Random trivia question, category can be null for any
    getRandom(category = null) {
        const row = randomQuestion.get(category, category) ?? null;
        if (!row) return null;
        row.answers = JSON.parse(row.answers);
        return row;
    }
}

// Trivia Cache
let triviaCache = null;

// Function to reload the trivia cache
function reloadCache() {
    triviaCache = module.exports.list(null, 1000, 1);
}