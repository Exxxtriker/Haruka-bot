/* eslint-disable max-len */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../../utils/dataManager');

const isTreasureOpeningInProgress = {}; // Para evitar spam

// Definindo as chances de cada item
const itemChances = {
    Ouro: 50, // 50% de chance
    Diamante: 40, // 40% de chance
    Joia: 30, // 30% de chance
    'Chave [NULL]': 3, // 3% de chance
};

// Função para selecionar um item com base nas chances
function getRandomItem() {
    const totalWeight = Object.values(itemChances).reduce((acc, weight) => acc + weight, 0);
    let randomNum = Math.floor(Math.random() * totalWeight);

    for (const [item, weight] of Object.entries(itemChances)) {
        randomNum -= weight;
        if (randomNum < 0) {
            return item;
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abrir-tesouro')
        .setDescription('Abra um tesouro!'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Verificar se o comando está sendo executado
        if (isTreasureOpeningInProgress[userId]) {
            return interaction.reply({ content: '⛔ Você já está abrindo um tesouro. Por favor, espere antes de tentar novamente!', ephemeral: true });
        }

        // Definir o usuário como em progresso
        isTreasureOpeningInProgress[userId] = true;

        try {
            // Carregar os dados do jogo
            let data = dataManager.getGameData();

            // Inicializar o usuário, se necessário
            if (!data[userId]) {
                dataManager.initializeUser(userId);
                data = dataManager.getGameData(); // Recarregar os dados após a inicialização
            }

            const user = data[userId];

            // Verificar se o usuário tem pelo menos um tesouro
            if (!user.inventory.Tesouro || user.inventory.Tesouro < 1) {
                return interaction.reply({ content: '⛔ Você não tem tesouros suficientes para abrir!', ephemeral: true });
            }

            // Remover um tesouro do inventário
            dataManager.removeItemFromInventory(userId, 'Tesouro', 1);

            // Gerar um item aleatório como recompensa
            const reward = getRandomItem();
            const rewardQuantity = Math.floor(Math.random() * 3) + 1; // Quantidade aleatória entre 1 e 3

            // Adicionar o item ao inventário do usuário
            dataManager.addItemToInventory(userId, reward, rewardQuantity);

            // Atualizar a quantidade de tesouros restantes
            const remainingTreasures = user.inventory.Tesouro - 1;

            // Embed de sucesso
            const embed = new EmbedBuilder()
                .setColor('#FFD700') // Ouro
                .setTitle('🏆 Tesouro aberto!')
                .setDescription(`Você abriu um tesouro e encontrou **${rewardQuantity}x ${reward}**!`)
                .addFields(
                    { name: 'Tesouros restantes', value: `${remainingTreasures}`, inline: true },
                    { name: 'Inventário atualizado', value: `${reward}: ${user.inventory[reward] ? user.inventory[reward] + rewardQuantity : rewardQuantity}`, inline: true },
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Continue explorando para encontrar mais tesouros!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao executar o comando de abrir tesouro:', error);
            interaction.reply({ content: '❌ Ocorreu um erro ao tentar abrir o tesouro. Tente novamente mais tarde!', ephemeral: true });
        } finally {
            // Liberar o bloqueio
            isTreasureOpeningInProgress[userId] = false;
        }
    },
};
