const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Exibe o avatar de um usuário e oferece um botão para baixá-lo.')
        .addUserOption((option) => option.setName('usuário')
            .setDescription('Selecione o usuário')
            .setRequired(false))
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        const user = interaction.options.getUser('usuário') || interaction.user; // Pega o usuário selecionado ou quem executou
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 }); // Avatar em alta resolução

        // Cria o botão para download
        const downloadButton = new ButtonBuilder()
            .setLabel('Baixar Avatar')
            .setStyle(ButtonStyle.Link) // Estilo de link (abre URL)
            .setURL(avatarUrl); // URL do avatar

        // Adiciona o botão em uma linha de ação
        const row = new ActionRowBuilder().addComponents(downloadButton);

        // Envia a mensagem com o botão e o embed do avatar
        await interaction.reply({
            content: `Aqui está o avatar de ${user.username}:`,
            embeds: [
                {
                    color: 0x8B0000,
                    title: `${user.username}'s Avatar`,
                    image: { url: avatarUrl },
                    footer: {
                        text: `Solicitado por ${interaction.user.username}`,
                        icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
                    },
                },
            ],
            components: [row], // Inclui o botão
        });
    },
};
