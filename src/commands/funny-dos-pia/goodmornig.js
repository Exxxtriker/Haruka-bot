const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const goodImages2 = [

    'https://media.tenor.com/-BUqSTEelzwAAAAC/tf2-team-fortress-2.gif',
    'https://media.tenor.com/McQxYBr8CecAAAAC/good-morning-good-morning-tuesday-images.gif',
    'https://media.tenor.com/FbVVHf2bPHwAAAAC/good-morning-good-morning-images.gif',
    'https://media.tenor.com/7oYsKmaxqEoAAAAC/scout-scout-tf2.gif',
    'https://media.tenor.com/NDpk0emi7PEAAAAC/tf2-engineer.gif',
    // Adicione mais URLs conforme necessário
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('good-morning')
        .setDescription('*Bom dia*'),
    async execute(interaction) {
        const randomImageUrl = goodImages2[Math.floor(Math.random() * goodImages2.length)];

        const embed = new EmbedBuilder()
            .setTitle('🌸 Good Morning 🌸')
            .setDescription('💖Que o seu dia seja maravilhoso💖')
            .setColor('000000')
            .setImage(randomImageUrl)
            .setTimestamp()
            .setFooter({ text: 'Haruka Harano 運', iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png' });

        await interaction.reply({ embeds: [embed] });
    },
};
