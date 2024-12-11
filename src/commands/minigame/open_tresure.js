/* eslint-disable no-plusplus */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../../utils/dataManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abrir-tesouro')
        .setDescription('Abra um tesouro e descubra as riquezas dentro dele!')
        .setDMPermission(false), // Desabilita o comando na DM

    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            // Inicializar usuário no sistema
            dataManager.initializeUser(userId);
            const user = dataManager.getGameData()[userId];

            // Verificar se o jogador possui um tesouro para abrir
            const treasureKey = 'Tesouro';
            if (!user.inventory[treasureKey] || user.inventory[treasureKey] <= 0) {
                return interaction.reply({
                    content: '⛔ Você não possui nenhum tesouro para abrir!',
                    ephemeral: true,
                });
            }

            // Reduzir a quantidade de tesouros no inventário
            user.inventory[treasureKey] -= 1;

            // Sistema de chances de drop
            const itemChances = {
                Ouro: 50, // 50% de chance
                Diamante: 40, // 40% de chance
                Joia: 30, // 30% de chance
                'Chave [NULL]': 1, // 1% de chance
            };

            const items = Object.keys(itemChances);
            const chanceValues = Object.values(itemChances);
            const totalChance = chanceValues.reduce((acc, chance) => acc + chance, 0);

            const random = Math.random() * totalChance;
            let cumulative = 0;
            let droppedItem = null;

            for (let i = 0; i < items.length; i++) {
                cumulative += chanceValues[i];
                if (random <= cumulative) {
                    droppedItem = items[i];
                    break;
                }
            }

            // Atualizar o inventário do usuário com o item encontrado
            const quantity = Math.floor(Math.random() * 5) + 1; // Quantidade aleatória (1 a 5)
            dataManager.addItemToInventory(userId, droppedItem, quantity);

            // Salvar os dados atualizados
            dataManager.setGameData({ [userId]: user });

            // Criar embed para exibir o resultado
            const embed = new EmbedBuilder()
                .setColor('#FFD700') // Cor dourada
                .setTitle('🏆 Tesouro aberto!')
                .setDescription(`Você abriu um tesouro e encontrou **${quantity}x ${droppedItem}**!`)
                .addFields(
                    { name: 'Tesouros restantes', value: `${user.inventory[treasureKey]}`, inline: true },
                    { name: 'Inventário atualizado', value: `${droppedItem}: ${user.inventory[droppedItem] || quantity}`, inline: true },
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Continue explorando para encontrar mais tesouros!' })
                .setTimestamp();

            // Responder a interação com o embed
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao executar o comando de abrir-tesouro:', error);
            interaction.reply({
                content: '❌ Ocorreu um erro ao tentar abrir o tesouro. Tente novamente mais tarde!',
                ephemeral: true,
            });
        }
    },
};
