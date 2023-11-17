const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event-canonic')
        .setDescription('*Evento canonico*'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⚠️ Atenção Event Canonic Incomming ⚠️')
            .setDescription('O Evento canonico chegou ahhhh🔥')
            .setColor('000000')
            .setURL('https://www.youtube.com/watch?v=XCv1vXlaZd4')
            .setImage('https://img1.picmix.com/output/pic/normal/5/2/5/6/11266525_6b145.gif')
            .setTimestamp()
            .setFooter({ text: 'Haruka Harano 運', iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png' });

        await interaction.reply({ embeds: [embed] });
    },
};
