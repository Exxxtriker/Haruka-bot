/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../../utils/dataManager');
const { STAMINA_RECHARGE_TIME, FISHING_COST } = require('../../utils/config');

const isFishingInProgress = {}; // Para evitar spam

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pescar')
        .setDescription('Pesque para obter peixes e recursos!')
        .setDMPermission(false), // Desabilita o comando na DM

    async execute(interaction) {
        const userId = interaction.user.id;

        // Verificar se o comando está sendo executado
        if (isFishingInProgress[userId]) {
            return interaction.reply({
                content: '⛔ Você já está pescando. Por favor, espere antes de tentar novamente!',
                flag: 64,
            });
        }

        // Definir o usuário como em progresso
        isFishingInProgress[userId] = true;

        try {
            await interaction.deferReply({ flag: 64 });

            const fishChances = {
                'Peixe comum': 80,
                'Peixe raro': 10,
                Tesouro: 3,
                Linha: 15,
                'Peixe lendário': 2,
                'Peixe mítico': 0.01,
            };

            // Carregar os dados do jogo
            let data = dataManager.getGameData();

            // Inicializar o usuário, se necessário
            if (!data[userId]) {
                dataManager.initializeUser(userId);
                data = dataManager.getGameData(); // Recarregar os dados após a inicialização
            }

            const user = data[userId];

            // Verificar se o usuário tem a vara de pesca
            if (!user.inventory['Vara de pesca'] || user.inventory['Vara de pesca'] <= 0) {
                return interaction.editReply({
                    content: '⛔ Você não tem uma vara de pesca! Adquira uma antes de tentar pescar.',
                });
            }

            // Verificar se o usuário tem isca
            if (!user.inventory.Isca || user.inventory.Isca <= 0) {
                return interaction.editReply({
                    content: '⛔ Você não tem isca! Adquira isca antes de tentar pescar.',
                });
            }

            // Recarregar estamina, se necessário
            dataManager.rechargeStamina(userId);

            // Verificar se há estamina suficiente
            if (user.stamina < FISHING_COST) {
                const timeRemaining = dataManager.getTimeRemaining(userId, STAMINA_RECHARGE_TIME);

                // Embed para indicar tempo restante
                const embed = new EmbedBuilder()
                    .setColor('#FF5733') // Vermelho
                    .setTitle('⛔ Estamina insuficiente!')
                    .setDescription(`Sua estamina está esgotada! Espere **${timeRemaining}** para recarregar.`)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter({ text: 'Aguarde até que sua estamina recarregue!' })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            // Determinar o item coletado com base nas chances
            const randomValue = Math.random() * 100;
            let caughtItem;

            if (randomValue < fishChances['Peixe mítico']) {
                caughtItem = 'Peixe mítico';
            } else if (randomValue < fishChances['Peixe lendário'] + fishChances['Peixe mítico']) {
                caughtItem = 'Peixe lendário';
            } else if (randomValue < fishChances.Tesouro + fishChances['Peixe lendário'] + fishChances['Peixe mítico']) {
                caughtItem = 'Tesouro';
            } else if (randomValue < fishChances['Peixe raro'] + fishChances.Tesouro + fishChances['Peixe lendário'] + fishChances['Peixe mítico']) {
                caughtItem = 'Peixe raro';
            } else if (randomValue < fishChances.Linha + fishChances['Peixe raro'] + fishChances.Tesouro + fishChances['Peixe lendário'] + fishChances['Peixe mítico']) {
                caughtItem = 'Linha';
            } else {
                caughtItem = 'Peixe comum';
            }

            const quantity = 1; // Sempre pescar 1 item

            // Adicionar o item coletado ao inventário
            dataManager.addItemToInventory(userId, caughtItem, quantity);

            // Consumir estamina e isca
            user.stamina -= FISHING_COST;
            if (user.inventory.Isca > 0) {
                user.inventory.Isca -= 1; // Consumir 1 isca
            }
            user.lastInteraction = Date.now();

            // Salvar os dados atualizados
            dataManager.setGameData({ [userId]: user });

            // Embed de sucesso
            const embed = new EmbedBuilder()
                .setColor('#4CAF50') // Verde
                .setTitle('🐟 Pesca bem-sucedida!')
                .setDescription(`Você pescou **${quantity}x ${caughtItem}**!`)
                .addFields(
                    { name: 'Estamina restante', value: `${user.stamina}`, inline: true },
                    { name: 'Inventário atualizado', value: `${caughtItem}: ${user.inventory[caughtItem] || 0}`, inline: true },
                    { name: 'Isca restante', value: `${user.inventory.Isca}`, inline: true },
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Continue pescando para obter mais recursos!' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao executar o comando de pesca:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar pescar. Tente novamente mais tarde!' });
        } finally {
            isFishingInProgress[userId] = false;
        }
    },
};
