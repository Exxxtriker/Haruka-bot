const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

// Carregar dados dos itens do arquivo JSON
const itemsPath = path.join(__dirname, 'datamc', 'datamc.json'); // Ajuste o caminho conforme necessário
const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));

// Função para normalizar strings (remover espaços e converter para minúsculas)
const normalizeString = (str) => str.toLowerCase().replace(/\s+/g, '');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcwiki')
        .setDescription('Exibe informações sobre Minecraft.')
        .addStringOption((option) => option.setName('procurar')
            .setDescription('O nome do item (ex: diamante, espada)')
            .setRequired(true))
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        const itemName = normalizeString(interaction.options.getString('procurar')); // Normaliza a entrada

        // Criar um mapeamento normalizado dos itens
        const normalizedItems = Object.keys(itemsData).reduce((acc, key) => {
            acc[normalizeString(key)] = itemsData[key];
            return acc;
        }, {});

        // Verificar se o item normalizado existe
        const foundItem = normalizedItems[itemName];

        if (foundItem) {
            // Criando a embed com os dados do item
            const embed = new EmbedBuilder()
                .setTitle(foundItem.name)
                .setDescription(foundItem.description)
                .setThumbnail(foundItem.image)
                .addFields(
                    { name: 'ID', value: `\`${foundItem.id}\``, inline: true },
                    { name: 'Categoria', value: foundItem.category, inline: true },
                    { name: 'Como obter', value: foundItem.crafting || 'Desconhecido', inline: false },
                )
                .setColor(0x00ff00);

            // Adiciona a imagem do crafting, se existir
            if (foundItem.crafting_image) {
                embed.setImage(foundItem.crafting_image);
            }

            await interaction.reply({ embeds: [embed] }); // Enviando a embed
        } else {
            await interaction.reply(`Desculpe, não consegui encontrar informações sobre o item: ${itemName}`);
        }
    },
};
