const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');

const hugImages = [
    'https://media.tenor.com/J7eGDvGeP9IAAAAC/enage-kiss-anime-hug.gif',
    'https://media.tenor.com/FgLRE4gi5VoAAAAC/hugs-cute.gif',
    'https://media.tenor.com/pqXmHpbIy0MAAAAd/anime-anime-hug.gif',
    'https://media.tenor.com/RR4YJdzCJRMAAAAd/chainsaw-man-hug.gif',
    'https://media.tenor.com/My2v_lTI3LIAAAAC/hug-anime.gif',
    'https://media.tenor.com/2VVGNLi-EV4AAAAC/anime-cute.gif',
    // Adicione mais URLs conforme necessário
];
const hugImages2 = [

    'https://media.tenor.com/J7eGDvGeP9IAAAAC/enage-kiss-anime-hug.gif',
    'https://media.tenor.com/FgLRE4gi5VoAAAAC/hugs-cute.gif',
    'https://media.tenor.com/pqXmHpbIy0MAAAAd/anime-anime-hug.gif',
    'https://media.tenor.com/RR4YJdzCJRMAAAAd/chainsaw-man-hug.gif',
    'https://media.tenor.com/My2v_lTI3LIAAAAC/hug-anime.gif',
    'https://media.tenor.com/2VVGNLi-EV4AAAAC/anime-cute.gif',
    // Adicione mais URLs conforme necessário
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('*Marque a pessoa que você vai abraçar*')
        .addUserOption((option) => option.setName('alvo')
            .setDescription('Marque a pessoa que você deseja')
            .setRequired(true)),
    async execute(interaction) {
        const { id } = await interaction.options.getUser('alvo');
        const user = interaction.user;

        const retribuir = new ButtonBuilder()
            .setCustomId('retribuir')
            .setLabel('Retribuir')
            .setStyle(ButtonStyle.Success);

        const randomImageUrl = hugImages[Math.floor(Math.random() * hugImages.length)];
        const randomImageUrl2 = hugImages2[Math.floor(Math.random() * hugImages2.length)];

        const embed = new EmbedBuilder()
            .setTitle('🤗 Abraço 🤗')
            .setDescription(`${user} abraçou <@${id}> nuossa!\nヽ(￣ω￣(￣ω￣〃)ゝ`)
            .setColor('701198')
            .setImage(randomImageUrl)
            .setTimestamp()
            .setFooter({ text: 'Haruka Harano 運', iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png' });

        const row = new ActionRowBuilder()
            .addComponents(retribuir);

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = (i) => i.customId === 'retribuir' && i.user.id === id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (buttonInteraction) => {
            // Lógica para retribuir o beijo
            const retribuirEmbed = new EmbedBuilder()
                .setTitle('🤗 Abraço 2x 🤗')
                .setDescription(`<@${buttonInteraction.user.id}> retribuiu o abraço no ${user} !\nヽ(￣ω￣(￣ω￣〃)ゝ`)
                .setImage(randomImageUrl2)
                .setColor('701198')
                .setTimestamp()
                .setFooter({
                    text: 'Haruka Harano 運',
                    iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                });
            await interaction.editReply({ embeds: [embed], components: [] });
            await buttonInteraction.upgrade({ embeds: [retribuirEmbed] });
        });
    },
};
