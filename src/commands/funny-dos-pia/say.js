const { SlashCommandBuilder } = require('discord.js');

const OWNER_ID = '335012394226941966'; // ID do dono do bot

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('O bot diz uma mensagem (apenas para o dono).')
        .addStringOption((option) => option.setName('mensagem')
            .setDescription('A mensagem que o bot deve dizer, use \\n para pular linhas')
            .setRequired(true)),

    async execute(interaction) {
        // Verifica se o autor da interação é o dono do bot
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
        }

        const mensagem = interaction.options.getString('mensagem');

        // Envia a mensagem diretamente no canal
        await interaction.reply(mensagem.replace(/\\n/g, '\n')); // Substitui \\n por uma quebra de linha
    },
};
