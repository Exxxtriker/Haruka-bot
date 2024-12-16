const {
    SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle,
} = require('discord.js');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcprofile')
        .setDescription('Busca o perfil de um jogador do minecraft')
        .addStringOption((option) => option.setName('username')
            .setDescription('Nome de usuário do Minecraft')
            .setRequired(true))
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        const username = interaction.options.getString('username');
        try {
            // Defina o caminho do ícone local
            const iconPath = path.join(__dirname, 'imagens', 'server-icon.png');

            // Verifica se o ícone existe
            if (!fs.existsSync(iconPath)) {
                return interaction.reply({
                    content: '❌ O ícone do servidor não foi encontrado.',
                    ephemeral: true,
                });
            }

            // Faz a requisição à API da Mojang para pegar o UUID
            const response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
            const uuid = response.data.id;

            // URLs para o perfil e renderização
            const nameMCUrl = `https://namemc.com/profile/${uuid}`;
            const skinPreviewUrl = `https://minotar.net/armor/body/${uuid}.png`; // Renderização da skin
            const facePreviewUrl = `https://minotar.net/avatar/${uuid}.png`; // Rosto da skin
            const skinDownloadUrl = `https://minotar.net/download/${uuid}`; // URL para download da skin

            // Criar embed personalizada
            const embed = new EmbedBuilder()
                .setColor(0x5fb041)
                .setTitle('**Perfil do Minecraft**')
                .setDescription(
                    `**Jogador:** ${username} 👤 \n**Perfil NameMc:** [Clique aqui](${nameMCUrl}) 🔗 \n\n **Skin Preview:** 🎮`,
                )
                .setImage(skinPreviewUrl)
                .setThumbnail(facePreviewUrl) // Definir o rosto como thumbnail
                .setFooter({
                    iconURL: 'attachment://server-icon.png', // Referência ao arquivo anexado
                    text: `UUID: ${uuid} 💾`,
                })
                .setTimestamp();

            // Criar botão para baixar a skin
            const downloadButton = new ButtonBuilder()
                .setLabel('Baixar Skin')
                .setStyle(ButtonStyle.Link)
                .setURL(skinDownloadUrl);

            // Criar linha de ação para o botão
            const row = new ActionRowBuilder().addComponents(downloadButton);

            // Enviar embed com o ícone anexado e o botão
            await interaction.reply({
                embeds: [embed],
                files: [{ attachment: iconPath, name: 'server-icon.png' }], // Anexa o ícone
                components: [row], // Adiciona o botão
            });
        } catch (error) {
            console.error(error); // Log do erro para depuração
            await interaction.reply({
                content: '❌ Não foi possível encontrar o jogador. Tente novamente.',
                ephemeral: true,
            });
        }
    },
};
