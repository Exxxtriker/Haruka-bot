const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../../utils/dataManager');
const { STAMINA_RECHARGE_TIME, MINING_COST } = require('../../utils/config');

const isMiningInProgress = {}; // Para evitar spam

module.exports = {
    data: new SlashCommandBuilder()
        .setName('minerar')
        .setDescription('Minere para obter recursos!')
        .setDMPermission(false), // Desabilita o comando na DM

    async execute(interaction) {
        const userId = interaction.user.id;

        // Verificar se o comando está sendo executado
        if (isMiningInProgress[userId]) {
            return interaction.reply({ content: '⛔ Você já está minerando. Por favor, espere antes de tentar novamente!', flags: 64 });
        }

        // Definir o usuário como em progresso
        isMiningInProgress[userId] = true;

        try {
            const resources = ['Pedra', 'Ferro', 'Ouro', 'Diamante'];
            const refinedResources = {
                pedra: 'Pedra refinada',
                ferro: 'Ferro refinado',
                ouro: 'Ouro refinado',
                diamante: 'Diamante refinado',
            };

            // Inicializar o usuário, se necessário
            dataManager.initializeUser(userId);
            const user = dataManager.getGameData()[userId];

            // Recarregar estamina, se necessário
            dataManager.rechargeStamina(userId);

            // Verificar se há estamina suficiente
            if (user.stamina < MINING_COST) {
                const timeRemaining = dataManager.getTimeRemaining(userId, STAMINA_RECHARGE_TIME);

                // Embed para indicar tempo restante
                const embed = new EmbedBuilder()
                    .setColor('#FF5733') // Vermelho
                    .setTitle('⛔ Estamina insuficiente!')
                    .setDescription(`Sua estamina está esgotada! Espere **${timeRemaining}** para recarregar.`)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter({ text: 'Aguarde até que sua estamina recarregue!' })
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], flags: 64 });
            }

            // Determinar o recurso minerado
            const mined = resources[Math.floor(Math.random() * resources.length)];
            const quantity = Math.floor(Math.random() * 5) + 1;

            // Verificar se o jogador tem uma picareta de diamante
            const hasDiamondPickaxe = user.inventory.Picareta >= 1;

            // Chance de minerar um recurso refinado
            let refinedMineral = null;
            if (hasDiamondPickaxe) {
                const refinedChance = 35; // 35% de chance de minerar recurso refinado
                if (Math.random() * 100 < refinedChance) {
                    const lowerCasedMined = mined.toLowerCase();
                    if (refinedResources[lowerCasedMined]) {
                        refinedMineral = refinedResources[lowerCasedMined];
                    } else {
                        console.warn(`Recurso refinado não encontrado para: ${lowerCasedMined}`);
                    }
                }
            }

            // Adicionar o recurso minerado ao inventário
            const resourceToAdd = refinedMineral || mined;
            dataManager.addItemToInventory(userId, resourceToAdd, quantity);

            // Consumir estamina
            user.stamina -= MINING_COST;
            user.lastInteraction = Date.now();
            // Salvar os dados atualizados no banco de dados (ou arquivo)
            dataManager.setGameData({ [userId]: user });

            // Embed de sucesso
            const embed = new EmbedBuilder()
                .setColor('#4CAF50') // Verde
                .setTitle('⛏️ Mineração bem-sucedida!')
                .setDescription(`Você minerou **${quantity}x ${resourceToAdd}**!`)
                .addFields(
                    { name: 'Estamina restante', value: `${user.stamina}`, inline: true },
                    { name: 'Inventário atualizado', value: `${resourceToAdd}: ${user.inventory[resourceToAdd]}`, inline: true },
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Continue minerando para obter mais recursos!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao executar o comando de mineração:', error);
            interaction.reply({ content: '❌ Ocorreu um erro ao tentar minerar. Tente novamente mais tarde!', flags: 64 });
        } finally {
            // Liberar o bloqueio
            isMiningInProgress[userId] = false;
        }
    },
};
