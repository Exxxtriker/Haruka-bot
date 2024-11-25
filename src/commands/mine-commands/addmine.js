const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Caminho do arquivo JSON
const itemsPath = path.join(__dirname, 'datamc', 'datamc.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-wiki')
        .setDescription('Adiciona uma nova informação ao banco de dados JSON.')
        .addStringOption((option) => option
            .setName('name')
            .setDescription('Nome da ferramenta.')
            .setRequired(true))
        .addStringOption((option) => option
            .setName('description')
            .setDescription('Descrição da ferramenta.')
            .setRequired(true))
        .addStringOption((option) => option
            .setName('image')
            .setDescription('URL da imagem da ferramenta.')
            .setRequired(true))
        .addStringOption((option) => option
            .setName('crafting_image')
            .setDescription('URL da imagem de crafting.')
            .setRequired(true))
        .addStringOption((option) => option
            .setName('id')
            .setDescription('ID única da ferramenta.')
            .setRequired(true))
        .addStringOption((option) => option
            .setName('category')
            .setDescription('Categoria da ferramenta (Ex: Ferramenta, Arma).')
            .setRequired(true))
        .addStringOption((option) => option
            .setName('crafting')
            .setDescription('Receita de crafting da ferramenta.')
            .setRequired(true)),
    async execute(interaction) {
        // Verifica se o usuário é autorizado
        if (interaction.user.id !== '335012394226941966') {
            return interaction.reply({
                content: '❌ Você não tem permissão para usar este comando.',
                ephemeral: true,
            });
        }

        // Lendo os valores do comando
        const tool = {
            name: interaction.options.getString('name'),
            description: interaction.options.getString('description'),
            image: interaction.options.getString('image'),
            crafting_image: interaction.options.getString('crafting_image'),
            id: interaction.options.getString('id'),
            category: interaction.options.getString('category'),
            crafting: interaction.options.getString('crafting'),
        };

        try {
            // Lendo o arquivo JSON
            const data = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));

            // Adicionando a nova ferramenta
            data[tool.id] = tool;

            // Salvando de volta no arquivo
            fs.writeFileSync(itemsPath, JSON.stringify(data, null, 4));

            await interaction.reply(
                `✅ Ferramenta **${tool.name}** adicionada com sucesso ao banco de dados JSON.`,
            );
        } catch (error) {
            console.error(error);
            await interaction.reply(
                '❌ Houve um erro ao adicionar a ferramenta ao banco de dados JSON.',
            );
        }
    },
};
