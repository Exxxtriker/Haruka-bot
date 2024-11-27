const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../../utils/dataManager');

const isMiningInProgress = {}; // Para evitar spam

// Constantes para estamina e tempo de recarga
const MAX_ESTAMINA = 10;
const STAMINA_RECHARGE_TIME = 10800000; // 3 horas

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
                user = {
                    coins: 0,
                    inventory: {},
                    stamina: MAX_ESTAMINA,
                    lastMine: 0,
                };
                gameData[userId] = user;
            }

            const currentTime = Date.now();
            const timePassed = currentTime - user.lastMine;

            // Se o tempo de recarga de estamina passou, recarregar
            if (timePassed >= STAMINA_RECHARGE_TIME) {
                user.stamina = MAX_ESTAMINA;
                user.lastMine = currentTime;
            }

            // Verificar se há estamina suficiente
            if (user.stamina <= 0) {
                const timeRemaining = STAMINA_RECHARGE_TIME - timePassed;
                const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutes = Math.ceil((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

                return interaction.reply({
                    content: `⏳ Sua estamina está esgotada! Espere **${hours} horas e ${minutes} minutos** para recarregar.`,
                    ephemeral: true,
                });
            }

            // Determinar qual recurso o jogador minerou
            const mined = resources[Math.floor(Math.random() * resources.length)];
            const quantity = Math.floor(Math.random() * 5) + 1;

            // Verificar se o jogador tem uma picareta de diamante
            const hasDiamondPickaxe = user.inventory.picareta >= 1;

            // Se o jogador tiver picareta de diamante, existe uma chance de minerar um recurso refinado
            let refinedMineral = null;
            if (hasDiamondPickaxe) {
                const refinedChance = 35; // 50% de chance de minerar um recurso refinado
                if (Math.random() * 100 < refinedChance) {
                    refinedMineral = refinedResources[mined];
                }
            }

            // Adicionar recurso ao inventário
            const resourceToAdd = refinedMineral || mined;
            user.inventory[resourceToAdd] = (user.inventory[resourceToAdd] || 0) + quantity;
            user.stamina -= 1; // Consumir 1 de estamina

            // Salvar os dados
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
