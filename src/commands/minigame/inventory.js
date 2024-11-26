const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../../utils/datagame.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventario')
        .setDescription('Mostra o inventário do jogador'),
    async execute(interaction) {
        const userId = interaction.user.id;

        // Verificar se o arquivo existe
        if (!fs.existsSync(itemsPath)) {
            return interaction.reply('O arquivo de dados não foi encontrado!');
        }

        // Carregar os dados do arquivo JSON
        let data = {};
        try {
            data = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
        } catch (error) {
            console.error('Erro ao ler o arquivo JSON:', error);
            return interaction.reply('Erro ao carregar os dados do arquivo!');
        }

        // Verificar se o usuário existe no JSON
        const userData = data[userId];
        if (!userData || !userData.inventory) {
            return interaction.reply('Seu inventário está vazio ou você ainda não tem dados registrados!');
        }

        // Acessar inventário e coins do usuário
        const userInventory = userData.inventory;
        const userCoins = userData.coins || 0;

        // Criando a embed personalizada
        const embed = new EmbedBuilder()
            .setColor('#4CAF50') // Cor personalizada
            .setTitle(`📦 Inventário de ${interaction.user.username}`)
            .setThumbnail(interaction.user.displayAvatarURL()) // Imagem de perfil
            .setDescription(`Aqui estão os itens e moedas que você possui, ${interaction.user.username}!`)
            .addFields(
                { name: '💰 Coins', value: `${userCoins.toLocaleString()} moedas`, inline: false },
            )
            .setFooter({ text: 'Continue coletando recursos para expandir seu inventário!' })
            .setTimestamp();

        if (Object.keys(userInventory).length === 0) {
            embed.setDescription('**Seu inventário está vazio!** 😢');
            embed.setColor('#F44336'); // Cor para inventário vazio (vermelho)
        } else {
            let inventoryText = 'Aqui estão os itens que você possui:\n';
            for (const [item, quantity] of Object.entries(userInventory)) {
                inventoryText += `- **${item}**: ${quantity} unidades\n`;
            }
            embed.addFields({ name: '🛠️ Itens', value: inventoryText });
        }

        // Enviar a embed
        await interaction.reply({ embeds: [embed] });
    },
};
