const { Collection, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = async (client) => {
    client.commands = new Collection();

    const commandsPath = path.join(__dirname, '../commands/');
    const commandsDirs = fs.readdirSync(commandsPath);
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

            client.commands.set(commandsOf.data.name, commandsOf);
        }
    }

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: 'Houve um erro ao executar este comando.', flags: 64 });
        }
    });
};
