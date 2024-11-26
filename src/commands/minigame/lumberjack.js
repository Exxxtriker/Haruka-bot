const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGameData, setGameData, getTimeRemaining } = require('../../utils/dataManager');

const STAMINA_COST = 2; // Custo de estamina para pegar madeira
const RECHARGE_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 horas em milissegundos

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lenhador')
        .setDescription('Pega madeira e consome estamina!'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const gameData = getGameData();

        // Obter os dados do jogador
        const user = gameData[userId] || {
            coins: 0, inventory: {}, stamina: 10, lastMine: 0,
        };
        const currentTime = Date.now();

        // Verificar e recarregar estamina se o tempo de recarga tiver passado
        const timePassed = currentTime - user.lastMine;
        if (timePassed >= RECHARGE_INTERVAL_MS) {
            user.stamina = 10; // Recarrega a estamina
            user.lastMine = currentTime; // Atualiza o último tempo de ação
        }

        // Verificar se o jogador tem estamina suficiente
        if (user.stamina < STAMINA_COST) {
            const remainingTime = getTimeRemaining(userId, RECHARGE_INTERVAL_MS);
            return interaction.reply({
                content: `⏳ Você não tem estamina suficiente para pegar madeira! Espere ${remainingTime}`,
                ephemeral: true,
            });
        }

        // Atualizar inventário e estamina
        user.inventory.madeira = (user.inventory.madeira || 0) + 1; // Adiciona 1 madeira
        user.stamina -= STAMINA_COST; // Subtrai a estamina
        user.lastMine = currentTime; // Atualiza o tempo da última ação
        gameData[userId] = user; // Salva os dados do usuário

        setGameData(gameData); // Salva os dados no arquivo

        // Criar embed para resposta
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('Pegar Madeira 🪓')
            .setDescription(`Você pegou **1 madeira** e consumiu **${STAMINA_COST} estamina**!`)
            .addFields(
                { name: 'Estamina restante', value: `${user.stamina}`, inline: true },
                { name: 'Inventário', value: `Madeira: ${user.inventory.madeira}`, inline: true },
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        // Enviar resposta com embed
        await interaction.reply({ embeds: [embed] });
    },
};
