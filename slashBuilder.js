const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { clientId, token } = require('./config');

const commandsPath = path.join(__dirname, 'src', 'commands');
const commandsDirs = fs.readdirSync(commandsPath);
const commandsJSON = [];
const paths = [];

for (const dirs of commandsDirs) {
    const dirsOf = path.join(commandsPath, dirs);

    paths.push(dirsOf);
}

for (const files of paths) {
    const commands = fs.readdirSync(files).filter((filter) => filter.endsWith('.js'));

    for (const file of commands) {
        const fileOf = path.join(files, file);
        const commandsOf = require(fileOf);

        commandsJSON.push(commandsOf.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commandsJSON.length} application (/) commands.`);

        const data = await rest.put(Routes.applicationCommands(clientId), { body: commandsJSON });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
