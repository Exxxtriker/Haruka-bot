const { EmbedBuilder } = require('discord.js'); // Remova a barra final
const { getCargoValue } = require('../anuncio'); // Certifique-se de que o caminho está correto

module.exports = {
    id: 'utilidade-model',
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        const assunto = interaction.fields.getTextInputValue('assuntoInput');
        const descricao = interaction.fields.getTextInputValue('descricaoInput');
        const user = interaction.user;
        const cargo = getCargoValue();

        const embed = new EmbedBuilder()
            .setTitle('📣 **Anúncio** 📣\n')
            .setDescription(`O **${user}** quer fazer um anúncio:\n\n**Título do anúncio**:\n${assunto}\n**Descrição do Anúncio**:\n${descricao}`)
            .setColor('701198')
            .setImage('https://i.gifer.com/Wntc.gif')
            .setTimestamp()
            .setFooter({ text: 'Haruka Harano 運', iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png' });

        await interaction.reply({
            content: `<@&${cargo.id}>`, // Notifica o cargo
            embeds: [embed],
        });
    },
};
