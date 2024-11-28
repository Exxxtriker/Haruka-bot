const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../../utils/dataManager');
const { STAMINA_RECHARGE_TIME, FISHING_COST } = require('../../utils/config');

const isFishingInProgress = {}; // Para evitar spam

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pesca')
        .setDescription('Pesque para obter peixes e recursos!'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Verificar se o comando está sendo executado
        if (isFishingInProgress[userId]) {
            return interaction.reply({ content: '⛔ Você já está pescando. Por favor, espere antes de tentar novamente!', ephemeral: true });
        }

        // Definir o usuário como em progresso
        isFishingInProgress[userId] = true;

        try {
            // eslint-disable-next-line no-unused-vars
            const fishTypes = ['Peixe comum', 'Peixe raro', 'Peixe lendário', 'Peixe mítico'];
            const fishChances = {
                'peixe comum': 80,
                'peixe raro': 10,
                'peixe lendário': 3,
                'peixe mítico': 0.01,
            };

            // Carregar os dados do jogo
            let data = dataManager.getGameData();

            // Inicializar o usuário, se necessário
            if (!data[userId]) {
                dataManager.initializeUser(userId);
                data = dataManager.getGameData(); // Recarregar os dados após a inicialização
            }

            const user = data[userId];

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

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Determinar o peixe coletado com base nas chances
            const randomValue = Math.random() * 100;
            let caughtFish;

            if (randomValue < fishChances['peixe mítico']) {
                caughtFish = 'peixe mítico';
            } else if (randomValue < fishChances['peixe raro'] + fishChances['peixe mítico']) {
                caughtFish = 'peixe raro';
            } else if (randomValue < fishChances['peixe lendário'] + fishChances['peixe raro'] + fishChances['peixe mítico']) {
                caughtFish = 'peixe lendário';
            } else {
                caughtFish = 'peixe comum';
            }

            const quantity = 1; // Sempre pescar 1 peixe

            // Adicionar o peixe coletado ao inventário
            dataManager.addItemToInventory(userId, caughtFish, quantity);

            // Consumir estamina
            user.stamina -= FISHING_COST;
            user.lastInteraction = Date.now();
            // Salvar os dados atualizados no banco de dados (ou arquivo)
            dataManager.setGameData({ [userId]: user });

            // Embed de sucesso
            const embed = new EmbedBuilder()
                .setColor('#4CAF50') // Verde
                .setTitle('🐟 Pesca bem-sucedida!')
                .setDescription(`Você pescou **${quantity}x ${caughtFish}**!`)
                .addFields(
                    { name: 'Estamina restante', value: `${user.stamina}`, inline: true },
                    { name: 'Inventário atualizado', value: `${caughtFish}: ${user.inventory[caughtFish] || 0}`, inline: true },
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Continue pescando para obter mais recursos!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao executar o comando de pesca:', error);
            interaction.reply({ content: '❌ Ocorreu um erro ao tentar pescar. Tente novamente mais tarde!', ephemeral: true });
        } finally {
            // Liberar o bloqueio
            isFishingInProgress[userId] = false;
        }
    },
};
