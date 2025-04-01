/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const session = require('express-session');
const path = require('path');
const os = require('os'); // For system information
const WebSocket = require('ws');
const http = require('http');
const { requestLogger, registerWebSocketClient, logToFile } = require('./logger'); // Import the request logger and WebSocket registration
const routes = require('./routes/index');
const { token } = require('./config');
require('dotenv').config(); // Adicionado para carregar variáveis de ambiente

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // This intent is included
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.commandsExecuted = 0; // Initialize commandsExecuted
client.messagesProcessed = 0; // Initialize messagesProcessed

client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignore bot messages

    client.messagesProcessed += 1; // Increment messagesProcessed
    logToFile(`Message processed: ${message.content}`); // Log the message content

    // Example command handling logic
    const prefix = '!';
    if (message.content.startsWith(prefix)) {
        const [command, ...args] = message.content.slice(prefix.length).trim().split(/\s+/);
        logToFile(`Command executed: ${command} with args: ${args.join(' ')}`);
        client.commandsExecuted += 1; // Increment commandsExecuted
    }
});

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'haruka-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Use the request logger middleware
app.use(requestLogger);

app.use('/', routes);

// Middleware para proteger rotas
function isAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
        return next();
    }
    res.redirect('/login');
}

// Rotas
app.get('/', isAuthenticated, (req, res) => {
    res.render('home', {
        botName: client.user?.username || 'Bot',
        servers: client.guilds.cache.size,
        users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
        serversLink: '/servers', // Add link to servers page
    });
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) { // Usando variáveis de ambiente
        req.session.loggedIn = true;
        return res.redirect('/');
    }
    res.render('login', { error: 'Credenciais inválidas!' });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.get('/stats', isAuthenticated, (req, res) => {
    res.render('stats', { servers: client.guilds.cache.size, users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0) });
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    app.locals.bot = client; // Assign the bot instance after it's ready
});

require('./src/handlers/eventsHandler')(client);
require('./src/handlers/commandsHandler')(client);
require('./src/handlers/modalHadler')(client);

const server = http.createServer(app); // Create an HTTP server for WebSocket support
const wss = new WebSocket.Server({ server }); // Create a WebSocket server

// Handle WebSocket connections
wss.on('connection', (ws) => {
    registerWebSocketClient(ws);
    logToFile('WebSocket client connected'); // Log to file and broadcast to the dashboard console
});

// Start the server only after the bot is ready
client.login(token).then(() => {
    server.listen(3000, () => console.log('🌐 Web server running on http://localhost:3000'));
});
