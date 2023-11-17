const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('*Jogue ping pong com a haruka*'),
    async execute(interaction) {
        await interaction.reply('Pong !');
    },
};
