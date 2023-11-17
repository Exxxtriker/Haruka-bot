const { Events, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = (client) => {
    client.modalsMenu = new Collection();

    const modalPaths = path.join(__dirname, '../', 'commands');
    const modalsDirs = fs.readdirSync(modalPaths);
    const paths = [];

    for (const dirs of modalsDirs) {
        const dirsOf = path.join(modalPaths, dirs);
        paths.push(dirsOf);
    }

    for (const dirPath of paths) {
        const modals = fs.readdirSync(dirPath).filter((filter) => filter.match('modal-menu'));

        for (const modal of modals) {
            const filesPath = path.join(dirPath, modal);
            const files = fs.readdirSync(filesPath).filter((filter) => filter.endsWith('.js'));

            for (const file of files) {
                const filesOf = path.join(filesPath, file);
                const modalMenu = require(filesOf);

                client.modalsMenu.set(modalMenu.id, modalMenu);
            }
        }
    }

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isModalSubmit()) return;

        const modals = client.modalsMenu.get(interaction.customId);

        if (!modals) return;

        try {
            await modals.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.reply({ content: 'Houve um erro ao usar este comando.', ephemeral: true });
        }
    });
};
