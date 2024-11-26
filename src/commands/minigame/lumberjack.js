const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Caminho do arquivo de dados do jogo
const itemsPath = path.join(__dirname, '../../utils/datagame.json'); // O caminho já está correto se o arquivo estiver em ../../utils/datagame.json

// Funções auxiliares para carregar e salvar os dados do jogo
function getGameData() {
    if (!fs.existsSync(itemsPath)) {
        return {}; // Se o arquivo não existir, retornar um objeto vazio
    }
    const rawData = fs.readFileSync(itemsPath, 'utf8');
    return JSON.parse(rawData);
}

function setGameData(data) {
    // Salva os dados no arquivo JSON
    fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2), 'utf8');
}

function getTimeRemaining(lastMineTime, rechargeInterval) {
    const timePassed = Date.now() - lastMineTime;
    const timeLeft = rechargeInterval - timePassed;
    if (timeLeft <= 0) return 'agora';
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

const STAMINA_COST = 2; // Custo de estamina para pegar madeira
const RECHARGE_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 horas em milissegundos

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lenhador')
        .setDescription('Colete madeira!'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const gameData = getGameData();

        // Obter os dados do jogador ou criar um novo se não existir
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
            const remainingTime = getTimeRemaining(user.lastMine, RECHARGE_INTERVAL_MS);
            return interaction.reply({
                content: `⏳ Você não tem estamina suficiente para pegar madeira! Espere ${remainingTime}`,
                ephemeral: true,
            });
        }

        // Atualizar inventário e estamina
        user.inventory.madeira = (user.inventory.madeira || 0) + 1; // Adiciona 1 madeira
        user.stamina -= STAMINA_COST; // Subtrai a estamina
        user.lastMine = currentTime; // Atualiza o tempo da última ação
        gameData[userId] = user; // Atualiza os dados do jogador

        // Salva os dados no arquivo JSON
        setGameData(gameData);

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
