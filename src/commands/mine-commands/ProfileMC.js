const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('namemc')
        .setDescription('Busca o perfil de um jogador no NameMC.')
        .addStringOption((option) => option.setName('username')
            .setDescription('Nome de usuário do Minecraft')
            .setRequired(true)),

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
            const facePreviewUrl = `https://minotar.net/helm/${uuid}.png`; // Rosto da skin

            // Criar embed personalizada
            const embed = new EmbedBuilder()
                .setColor(0x5fb041)
                .setTitle('**Perfil do Minecraft**')
                .setDescription(
                    `**Jogador:** ${username} 👤 \n**Perfil:** [Clique aqui](${nameMCUrl}) 🔗 \n\n **Skin Preview:** 🎮`,
                )
                .setImage(skinPreviewUrl)
                .setThumbnail(facePreviewUrl) // Definir o rosto como thumbnail
                .setFooter({
                    iconURL: 'attachment://server-icon.png', // Referência ao arquivo anexado
                    text: `UUID: ${uuid} 💾`,
                })
                .setTimestamp();

            // Enviar embed com o ícone anexado
            await interaction.reply({
                embeds: [embed],
                files: [{ attachment: iconPath, name: 'server-icon.png' }], // Anexa o ícone
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Não foi possível encontrar o jogador. Tente novamente.',
                ephemeral: true,
            });
        }
    },
};
