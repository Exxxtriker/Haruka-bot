const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, 'datagame.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
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

        // Acessar inventário do usuário
        const userInventory = userData.inventory;

        // Criando a embed personalizada
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Inventário de ${interaction.user.username}`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        if (Object.keys(userInventory).length === 0) {
            embed.setDescription('**Seu Inventário está vazio!**');
        } else {
            let inventoryText = '';
            for (const [item, quantity] of Object.entries(userInventory)) {
                inventoryText += `- **${item}**: ${quantity}\n`;
            }
            embed.setDescription(inventoryText);
        }

        // Enviar a embed
        await interaction.reply({ embeds: [embed] });
    },
};
