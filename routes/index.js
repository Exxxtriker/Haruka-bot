/* eslint-disable no-await-in-loop */
const os = require('os'); // For memory usage
const express = require('express');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { botLogger } = require('../logger'); // Import the bot logger

const router = express.Router();

router.post('/login', (req, res) => {
    // ...existing login logic...
    botLogger('LOGIN', { user: req.body.username || 'Unknown' });
    res.redirect('/home'); // Redirect to the homepage after login
});

router.get('/home', (req, res) => {
    const { bot } = req.app.locals; // Access the bot instance

    if (!bot || !bot.readyAt) {
        botLogger('ERROR', { message: 'Bot is not ready' });
        return res.status(500).send('Bot is not ready. Please try again later.');
    }

    const { ping } = bot.ws; // Bot ping
    const monitoredUsers = bot.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0); // Total users being monitored
    const servers = bot.guilds.cache.map((guild) => guild.name); // List of server names
    const commands = bot.commands.map((cmd) => cmd.name); // Get the names of all commands

    botLogger('HOME_PAGE', { ping, monitoredUsers, serversCount: servers.length });

    // Operating system information
    const osInfo = {
        platform: os.platform(), // OS platform
        arch: os.arch(), // OS architecture
        uptime: `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`, // Uptime in hours and minutes
    };

    res.render('home', {
        ping, monitoredUsers, servers, osInfo, commands,
    });
});

router.get('/api/stats', (req, res) => {
    const { bot } = req.app.locals; // Access the bot instance

    if (!bot || !bot.readyAt) {
        botLogger('ERROR', { message: 'Bot is not ready' });
        return res.status(500).json({ error: 'Bot is not ready. Please try again later.' });
    }

    const { ping } = bot.ws; // Bot ping
    const monitoredUsers = bot.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0); // Total users being monitored
    const allServers = bot.guilds.cache.map((guild) => guild.name); // List of all server names
    const servers = allServers.slice(0, 3); // Get the first 3 servers
    const additionalServers = allServers.length - servers.length; // Calculate additional servers

    botLogger('API_STATS', { ping, monitoredUsers, serversCount: allServers.length });

    res.json({
        ping,
        monitoredUsers,
        servers,
        additionalServers, // Include the count of additional servers
    });
});

router.get('/dashboard', (req, res) => {
    const { bot } = req.app.locals; // Access the bot instance

    if (!bot || !bot.readyAt) {
        botLogger('ERROR', { message: 'Bot is not ready' });
        return res.status(500).send('Bot is not ready. Please try again later.');
    }

    const monitoredUsers = bot.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0); // Total users being monitored
    const serverCount = bot.guilds.cache.size; // Total number of servers
    const commandsExecuted = bot.commandsExecuted || 0; // Example: Total commands executed (replace with actual logic)
    const messagesProcessed = bot.messagesProcessed || 0; // Example: Total messages processed (replace with actual logic)

    botLogger('DASHBOARD_PAGE', {
        monitoredUsers, serverCount, commandsExecuted, messagesProcessed,
    });

    res.render('dashboard', {
        monitoredUsers,
        serverCount,
        commandsExecuted,
        messagesProcessed,
    });
});

router.get('/api/dashboard', (req, res) => {
    const { bot } = req.app.locals; // Access the bot instance

    if (!bot || !bot.readyAt) {
        botLogger('ERROR', { message: 'Bot is not ready' });
        return res.status(500).json({ error: 'Bot is not ready. Please try again later.' });
    }

    const monitoredUsers = bot.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0); // Total users being monitored
    const serverCount = bot.guilds.cache.size; // Total number of servers
    const commandsExecuted = bot.commandsExecuted || 0; // Retrieve updated commandsExecuted
    const messagesProcessed = bot.messagesProcessed || 0; // Retrieve updated messagesProcessed

    botLogger('API_DASHBOARD', {
        monitoredUsers, serverCount, commandsExecuted, messagesProcessed,
    });

    res.json({
        monitoredUsers,
        serverCount,
        commandsExecuted,
        messagesProcessed,
    });
});

router.get('/minigame', async (req, res) => {
    const { bot } = req.app.locals; // Access the bot instance
    const dataPath = path.join(__dirname, '../src/utils/datagame.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const playersData = JSON.parse(rawData);

    const players = await Promise.all(
        Object.entries(playersData).map(async ([id, player]) => {
            const totalItems = Object.values(player.inventory).reduce((sum, quantity) => sum + quantity, 0);
            let displayName = id; // Default to ID if displayName cannot be fetched
            let avatarURL = null; // Default to null if avatarURL cannot be fetched
            try {
                // Attempt to fetch the user from all guilds the bot is in
                for (const guild of bot.guilds.cache.values()) {
                    try {
                        const guildMember = await guild.members.fetch(id);
                        displayName = guildMember?.displayName || guildMember?.user.username || id;
                        avatarURL = guildMember?.user.displayAvatarURL({ dynamic: true, size: 64 }) || null;
                        break; // Stop searching once the user is found
                    } catch (guildError) {
                        if (guildError.code !== 10007) { // Suppress "Unknown Member" logs
                            console.warn(`Failed to fetch member ${id} in guild ${guild.id}:`, guildError.message);
                        }
                    }
                }
                // Fallback to fetching the user directly if not found in any guild
                if (displayName === id) {
                    const user = await bot.users.fetch(id);
                    displayName = user.username; // Use username if available
                    avatarURL = user.displayAvatarURL({ dynamic: true, size: 64 }) || null;
                }
            } catch (userError) {
                console.warn(`Failed to fetch user for ID ${id}:`, userError.message);
            }
            return {
                displayName,
                avatarURL,
                coins: player.coins,
                totalItems,
                inventory: player.inventory,
            };
        }),
    );

    res.render('minigame', { players });
});

router.get('/minigame/excel', async (req, res) => {
    const { bot } = req.app.locals; // Access the bot instance
    const dataPath = path.join(__dirname, '../src/utils/datagame.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const playersData = JSON.parse(rawData);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Minigame Data');

    // Add headers
    worksheet.columns = [
        { header: 'Nome do Jogador', key: 'username', width: 30 },
        { header: 'Total de Coins', key: 'coins', width: 15 },
        { header: 'Total de Itens', key: 'totalItems', width: 15 },
        { header: 'Inventário', key: 'inventory', width: 50 },
    ];

    // Add player data
    await Promise.all(
        Object.entries(playersData).map(async ([id, player]) => {
            const totalItems = Object.values(player.inventory).reduce((sum, quantity) => sum + quantity, 0);
            let username = id; // Default to ID if username cannot be fetched
            try {
                const user = await bot.users.fetch(id);
                username = user.username;
            } catch (error) {
                console.error(`Failed to fetch username for ID ${id}:`, error);
            }

            const inventoryString = Object.entries(player.inventory)
                .map(([item, quantity]) => `${item}: ${quantity}`)
                .join(', ');

            worksheet.addRow({
                username,
                coins: player.coins,
                totalItems,
                inventory: inventoryString,
            });
        }),
    );

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="minigame_data.xlsx"');

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
});

router.get('/servers', (req, res) => {
    const { bot } = req.app.locals;

    if (!bot || !bot.readyAt) {
        return res.status(500).send('Bot is not ready. Please try again later.');
    }

    const servers = bot.guilds.cache.map((guild) => ({
        id: guild.id,
        name: guild.name,
        iconURL: guild.iconURL({ dynamic: true, size: 64 }), // Fetch server icon URL
    }));

    res.render('servers', { servers });
});

router.get('/servers/:id/members', async (req, res) => {
    const { bot } = req.app.locals;

    if (!bot || !bot.readyAt) {
        return res.status(500).json({ error: 'Bot is not ready. Please try again later.' });
    }

    const guild = bot.guilds.cache.get(req.params.id);

    if (!guild) {
        return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    try {
        // Fetch all members explicitly
        await guild.members.fetch();

        const members = guild.members.cache.map((member) => ({
            displayName: member.displayName || member.user.username, // Use displayName or fallback to username
            avatarURL: member.user.displayAvatarURL({ dynamic: true, size: 64 }),
        }));

        res.json({ members });
    } catch (error) {
        if (error.code !== 10007) { // Suppress "Unknown Member" logs
            console.error(`Failed to fetch members for guild ${guild.id}:`, error.message);
        }
        res.status(500).json({ error: 'Failed to fetch members. Please try again later.' });
    }
});

router.get('/api/commands', async (req, res) => {
    const { bot } = req.app.locals; // Access the bot instance

    if (!bot || !bot.readyAt) {
        return res.status(500).json({ error: 'Bot is not ready. Please try again later.' });
    }

    try {
        // Fetch global application commands using Discord API
        const commands = await bot.application.commands.fetch();
        const commandDetails = commands
            .map(command => ({
                name: command.name,
                description: command.description,
            }))
            .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

        res.json({ commands: commandDetails });
    } catch (error) {
        console.error('Error fetching commands:', error);
        res.status(500).json({ error: 'Failed to fetch commands. Please try again later.' });
    }
});

module.exports = router;
