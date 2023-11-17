const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sadness')
        .setDescription('*Utilize sabiamente,(lembrando que o bot naõ esta incentivando o TAL ATO)*'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('☠️ Adeus Mundo Cruel ☠️')
            .setDescription('Não aguenta mais o servidor...')
            .setColor(0xc72c3b)
            .setImage('https://media.tenor.com/4dEJUJWd5xgAAAAC/pombo-jumping.gif')
            .setTimestamp()
            .setFooter({ text: 'Haruka Harano 運', iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png' });

        await interaction.reply({ embeds: [embed] });
    },
};
