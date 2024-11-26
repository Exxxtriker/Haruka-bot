const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../../utils/dataManager');

const isMiningInProgress = {}; // Para evitar spam

module.exports = {
    data: new SlashCommandBuilder()
        .setName('minerar')
        .setDescription('Minere para obter recursos!'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Verificar se o comando está sendo executado
        if (isMiningInProgress[userId]) {
            return interaction.reply({ content: '⛔ Você já está minerando. Por favor, espere antes de tentar novamente!', ephemeral: true });
        }

        // Definir o usuário como em progresso
        isMiningInProgress[userId] = true;

        try {
            const resources = ['pedra', 'ferro', 'ouro', 'diamante'];
            const refinedResources = {
                pedra: 'pedra refinada',
                ferro: 'ferro refinado',
                ouro: 'ouro refinado',
                diamante: 'diamante refinado',
            };

            // Carregar os dados do usuário
            const gameData = dataManager.getGameData();
            let user = gameData[userId];

            // Se o usuário não existir, inicializar os dados
            if (!user) {
                // eslint-disable-next-line no-multi-assign
                user = gameData[userId] = {
                    coins: 0,
                    inventory: {},
                    stamina: 10,
                    lastMine: 0,
                };
            }

            const currentTime = Date.now();
            const timePassed = currentTime - user.lastMine;

            // Tempo para recarregar estamina é agora 3 horas (10.800.000 ms)
            const staminaRechargeTime = 10800000;

            if (timePassed >= staminaRechargeTime) {
                user.stamina = 10;
                user.lastMine = currentTime;
            }

            // Verificar estamina suficiente
            if (user.stamina <= 0) {
                const timeRemaining = staminaRechargeTime - timePassed;

                const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutes = Math.ceil((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

                return interaction.reply({
                    content: `⏳ Sua estamina está esgotada! Espere **${hours} horas e ${minutes} minutos** para recarregar.`,
                    ephemeral: true,
                });
            }

            // Determinar qual recurso o jogador minerou (normal ou refinado)
            const mined = resources[Math.floor(Math.random() * resources.length)];
            const quantity = Math.floor(Math.random() * 5) + 1;

            // Verificar se o jogador possui uma picareta de diamante
            const hasDiamondPickaxe = user.inventory.picareta >= 1;

            // Se o jogador tiver uma picareta de diamante, existe uma chance de minerar um recurso refinado
            let refinedMineral = null;
            if (hasDiamondPickaxe) {
                const refinedChance = 50; // 50% de chance de minerar um recurso refinado
                if (Math.random() * 100 < refinedChance) {
                    refinedMineral = refinedResources[mined];
                }
            }

            // Se minerar um recurso refinado, adicione ao inventário, senão, adicione o recurso normal
            const resourceToAdd = refinedMineral || mined;

            user.inventory[resourceToAdd] = (user.inventory[resourceToAdd] || 0) + quantity;
            user.stamina -= 1; // Consome 1 de estamina para minerar

            // Salvar as alterações no cache
            dataManager.setGameData(gameData);

            // Criar embed de resposta
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

            // Enviar resposta ao usuário
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao executar o comando de mineração:', error);
            interaction.reply({ content: '❌ Ocorreu um erro ao tentar minerar. Tente novamente mais tarde!', ephemeral: true });
        } finally {
            // Liberar o bloqueio após a execução (ou em caso de erro)
            isMiningInProgress[userId] = false;
        }
    },
};
