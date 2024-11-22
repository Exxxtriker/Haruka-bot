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
            // Defina o caminho do ícone local (ajuste conforme necessário)
            const iconPath = path.join(__dirname, 'imagens', 'server-icon.png');

            // Verifica se o ícone existe e, caso contrário, usa um ícone padrão
            const iconExists = fs.existsSync(iconPath);
            // Faz a requisição à API da Mojang para pegar o UUID

            const response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
            const uuid = response.data.id;

            // URLs para o perfil e renderização
            const nameMCUrl = `https://namemc.com/profile/${uuid}`;
            const skinPreviewUrl = `https://minotar.net/body/${uuid}.png`; // Usando minotar.net para renderizar a skin
            const facePreviewUrl = `https://minotar.net/helm/${uuid}.png`; // Rosto da skin

            // Criar embed personalizada
            const embed = new EmbedBuilder()
                .setColor(0x5fb041)
                .setTitle('**Perfil do Minecraft**')
                .setDescription(`**Jogador:** ${username} 👤 \n**Perfil:** [Clique aqui](${nameMCUrl}) 🔗 \n\n **Skin Preview:** 🎮`)
                .setImage(skinPreviewUrl)
                .setThumbnail(facePreviewUrl) // Definir o rosto como thumbnail
                .setFooter({
                    iconURL: 'attachment://server-icon.png',
                    text: `UUID: ${uuid} 💾`,
                })
                .setTimestamp();

            // Enviar embed sem texto adicional
            await interaction.reply({
                embeds: [embed],
            });

            const attachment = iconExists ? { files: [{ attachment: iconPath, name: 'server-icon.png' }] } : {};

            return interaction.editReply({
                embeds: [embed],
                ...attachment, // Envia o arquivo de imagem se o ícone existir
            });
        } catch (error) {
            console.error('Erro ao buscar informações do jogador:', error);
            await interaction.reply({
                content: '❌ Não foi possível encontrar o jogador. Tente novamente.',
                ephemeral: true,
            });
        }
    },
};
