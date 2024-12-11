const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../../utils/dataManager');
const { STAMINA_RECHARGE_TIME, WOOD_COST } = require('../../utils/config');

const isLumberjackInProgress = {}; // Para evitar spam

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lenhador')
        .setDescription('Pegue madeira para obter recursos!')
        .setDMPermission(false), // Desabilita o comando na DM

    async execute(interaction) {
        const userId = interaction.user.id;

        // Verificar se o comando está sendo executado
        if (isLumberjackInProgress[userId]) {
            return interaction.reply({ content: '⛔ Você já está pegando madeira. Por favor, espere antes de tentar novamente!', ephemeral: true });
        }

        // Definir o usuário como em progresso
        isLumberjackInProgress[userId] = true;

        try {
            const resource = 'Madeira'; // Apenas madeira normal
            const quantity = Math.floor(Math.random() * 5) + 1; // Quantidade aleatória de madeira

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
            if (user.stamina < WOOD_COST) {
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

            // Adicionar o recurso coletado ao inventário
            dataManager.addItemToInventory(userId, resource, quantity);

            // Consumir estamina
            user.stamina -= WOOD_COST;
            user.lastInteraction = Date.now();
            // Salvar os dados atualizados no banco de dados (ou arquivo)
            dataManager.setGameData({ [userId]: user });

            // Embed de sucesso
            const embed = new EmbedBuilder()
                .setColor('#4CAF50') // Verde
                .setTitle('🌲 Coleta bem-sucedida!')
                .setDescription(`Você coletou **${quantity}x ${resource}**!`)
                .addFields(
                    { name: 'Estamina restante', value: `${user.stamina}`, inline: true },
                    { name: 'Inventário atualizado', value: `${resource}: ${user.inventory[resource] || 0}`, inline: true },
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Continue coletando para obter mais recursos!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao executar o comando de coleta de madeira:', error);
            interaction.reply({ content: '❌ Ocorreu um erro ao tentar coletar madeira. Tente novamente mais tarde!', ephemeral: true });
        } finally {
            // Liberar o bloqueio
            isLumberjackInProgress[userId] = false;
        }
    },
};
