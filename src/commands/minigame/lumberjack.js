const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { WOOD_COST, STAMINA_RECHARGE_TIME } = require('../../utils/config'); // Importando a constante WOOD_COST
const dataManager = require('../../utils/dataManager'); // Importando o dataManager

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lenhador')
        .setDescription('Colete madeira!'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Inicializar o usuário se não existir
        dataManager.initializeUser(userId);

        // Verificar se o usuário tem estamina suficiente para coletar madeira
        if (!dataManager.hasSufficientStamina(userId)) {
            const timeRemaining = dataManager.getTimeRemaining(userId, STAMINA_RECHARGE_TIME);

            // Criar a embed de tempo restante para recarregar estamina
            const embed = new EmbedBuilder()
                .setColor('#FF5733') // Cor vermelha
                .setTitle('⛔ Estamina Insuficiente!')
                .setDescription(`Sua estamina está esgotada! Espere **${timeRemaining}** para recarregar.`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Aguarde até que sua estamina recarregue!' })
                .setTimestamp();

            // Retorna a resposta com a embed indicando o tempo de recarga
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Código para coleta de madeira, caso o jogador tenha estamina suficiente
        const currentTime = Date.now();

        // Atualizar o inventário e a estamina
        dataManager.addItemToInventory(userId, 'madeira', 1); // Adiciona 1 madeira ao inventário
        dataManager.updateStamina(userId, dataManager.getGameData()[userId].stamina - WOOD_COST); // Subtrai estamina do jogador

        // Atualiza o tempo de coleta de madeira
        dataManager.setGameData({
            [userId]: { lastMine: currentTime, lastwoods: currentTime },
        });

        // Criar a embed de sucesso com os detalhes da coleta
        const embed = new EmbedBuilder()
            .setColor('#FFD700') // Cor dourada
            .setTitle('Pegar Madeira 🪓')
            .setDescription(`Você pegou **1 madeira** e consumiu **${WOOD_COST} estamina**!`)
            .addFields(
                { name: 'Estamina restante', value: `${dataManager.getGameData()[userId].stamina}`, inline: true },
                { name: 'Inventário', value: `Madeira: ${dataManager.getGameData()[userId].inventory.madeira}`, inline: true },
            // { name: 'Última coleta de madeira', value: `<t:${Math.floor(dataManager.getGameData()[userId].lastwoods / 1000)}:R>`, inline: true },
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        // Retorna a resposta com a embed de sucesso
        await interaction.reply({ embeds: [embed] });
    },
};
