const { Collection, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = async (client) => {
    client.commands = new Collection();

    const commandsPath = path.join(__dirname, '../commands/');
    const commandsDirs = fs.readdirSync(commandsPath);

    for (const dir of commandsDirs) {
        const dirPath = path.join(commandsPath, dir);
        const commandFiles = fs.readdirSync(dirPath).filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(dirPath, file);
            const command = require(filePath);
            client.commands.set(command.data.name, command);
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
