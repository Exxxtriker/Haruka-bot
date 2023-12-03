const { Client } = require('discord.js');

const client = new Client();
client.buttons = new Map();

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const button = client.buttons.get(interaction.customId);
    if (button) {
        button(interaction);
    }
});

module.exports = {
    addButton: (customId, callback) => {
        client.buttons.set(customId, callback);
    },
};
