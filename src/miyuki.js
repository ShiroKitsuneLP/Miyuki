// Import necessary moduls
const path = require('path');

// Import Function to Start Miyuki
const { startMiyuki } = require(path.join(__dirname, './utils/client'));

// Start Miyuki
startMiyuki().catch(console.error);