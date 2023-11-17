const {
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputStyle,
    TextInputBuilder,
} = require('discord.js');

let cargoValue;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anuncio')
        .setDescription('*Utilize para confeccionar um anúncio ao servidor...*')
        .addStringOption((option) => option.setName('mencao')
            .setDescription('Selecione o cargo para mencionar')
            .setRequired(true)),
    async execute(interaction) {
        const mencao = await interaction.options.getString('mencao');
        cargoValue = mencao;

        const modal = new ModalBuilder()
            .setCustomId('utilidade-model')
            .setTitle('Anúncio...');

        const assuntoInput = new TextInputBuilder()
            .setCustomId('assuntoInput')

            .setLabel('Qual o título do anúncio ?')

            .setStyle(TextInputStyle.Short);

        const descricaoInput = new TextInputBuilder()
            .setCustomId('descricaoInput')
            .setLabel('Descreva o anúncio...')

            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder().addComponents(assuntoInput);
        const secondActionRow = new ActionRowBuilder().addComponents(descricaoInput);

        modal.addComponents(firstActionRow, secondActionRow);
        await interaction.showModal(modal);
    },
    getCargoValue: () => cargoValue,

};
