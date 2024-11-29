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
            .setColor('#4B9E6F') // Cor de verde escuro (semelhante à cor de uma mochila)
            .setTitle(`**Mochila de ${interaction.user.username}** 🎒`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })) // Imagem de perfil
            .setDescription(`Dê uma olhada em sua mochila, ${interaction.user.username}.\nAqui estão os recursos e itens que você carrega!`)
            .addFields(
                {
                    name: '**Moedas**: ',
                    value: `**${userCoins.toLocaleString()}** moedas 💰`,
                    inline: true,
                },
            )
            .setFooter({ text: 'Continue explorando e coletando para sua mochila!' })
            .setTimestamp();

        if (Object.keys(userInventory).length === 0) {
            embed.setDescription('**Sua mochila está vazia!** \n Procure mais itens para colocar nela!');
            embed.setColor('#E74C3C'); // Cor vermelha para mochila vazia
        } else {
            // Listar itens de forma organizada, com um estilo de "pockets" ou "compartimentos"
            let inventoryText = '**Itens armazenados:**\n';
            for (const [item, quantity] of Object.entries(userInventory)) {
                inventoryText += `- **${item.charAt(0).toUpperCase() + item.slice(1)}**: ${quantity} unidades\n`;
            }

            embed.addFields({
                name: '**Compartimentos da Mochila** 🛠️ ',
                value: inventoryText,
                inline: false,
            });
        }

        // Enviar a embed
        await interaction.reply({ embeds: [embed] });
    },
};
