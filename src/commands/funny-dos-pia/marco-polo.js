const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marco')
        .setDescription('*Mande um Marco e espere o melhor*'),
    async execute(interaction) {
        await interaction.reply('Polo !');
    },
};
