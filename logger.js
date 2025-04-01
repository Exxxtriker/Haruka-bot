const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'logs', 'bot.log');
let websocketClients = []; // Store connected WebSocket clients

// Ensure the logs directory exists
if (!fs.existsSync(path.dirname(logFilePath))) {
    fs.mkdirSync(path.dirname(logFilePath));
}

// Function to log messages to a file and broadcast to WebSocket clients
function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage, 'utf8');

    // Broadcast the log message to all connected WebSocket clients
    websocketClients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(logMessage);
        }
    });
}

// Middleware to log HTTP requests
function requestLogger(req, res, next) {
    const logMessage = `HTTP ${req.method} ${req.url}`;
    logToFile(logMessage);
    next();
}

// Function to log bot activities
function botLogger(event, details) {
    const logMessage = `BOT EVENT: ${event} - ${JSON.stringify(details)}`;
    logToFile(logMessage);
}

// Function to register WebSocket clients
function registerWebSocketClient(client) {
    websocketClients.push(client);
    client.on('close', () => {
        websocketClients = websocketClients.filter((c) => c !== client);
    });
}

module.exports = {
    logToFile,
    requestLogger,
    botLogger,
    registerWebSocketClient,
};
