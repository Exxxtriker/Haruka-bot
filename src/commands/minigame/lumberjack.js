const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../../utils/datagame.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lenhador')
        .setDescription('Pega madeira e consome estamina!'),
    async execute(interaction) {
        const userId = interaction.user.id;

        // Carregar os dados do usuário
        let data;
        try {
            data = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
        } catch (error) {
            console.error('Erro ao carregar o arquivo JSON:', error);
            return interaction.reply('Erro ao carregar os dados. Tente novamente mais tarde.');
        }

        // Obter os dados do jogador
        const user = data[userId] || { coins: 0, inventory: {}, stamina: 10 }; // Valor padrão de estamina é 10
        const staminaCost = 2; // Estamina necessária para pegar madeira

        // Verificar se o jogador tem estamina suficiente
        if (user.stamina < staminaCost) {
            return interaction.reply('Você não tem estamina suficiente para pegar madeira!');
        }

        // Atualizar o inventário e a estamina
        user.inventory.madeira = (user.inventory.madeira || 0) + 1; // Adiciona 1 madeira
        user.stamina -= staminaCost; // Subtrai a estamina

        data[userId] = user; // Atualiza os dados do usuário

        // Salvar os dados no arquivo JSON
        try {
            fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Erro ao salvar os dados no arquivo:', error);
            return interaction.reply('Erro ao salvar os dados. Tente novamente mais tarde.');
        }

        // Criar embed personalizada para a resposta
        const embed = new EmbedBuilder()
            .setColor('#FFD700') // Cor marrom representando a madeira
            .setTitle('Pegar Madeira 🪓')
            .setDescription(`Você pegou **1 madeira** e consumiu **${staminaCost} estamina**! 🪓`)
            .addFields(
                { name: 'Estamina restante', value: `**${user.stamina}** estamina`, inline: true },
                { name: 'Inventário', value: `Madeira: **${user.inventory.madeira || 0}**`, inline: true },
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        // Enviar resposta com embed
        await interaction.reply({ embeds: [embed] });
    },
};
