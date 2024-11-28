/* eslint-disable no-use-before-define */
const fs = require('fs');
const path = require('path');
const { MAX_ESTAMINA, STAMINA_RECHARGE_TIME } = require('./config');

// Caminho para o arquivo JSON onde os dados são armazenados
const dataPath = path.join(__dirname, 'datagame.json');

// Objeto para armazenar os dados carregados
let gameData = {};

// Função para carregar os dados do arquivo
function loadData() {
    try {
        if (fs.existsSync(dataPath)) {
            const fileContent = fs.readFileSync(dataPath, 'utf8').trim();
            gameData = fileContent ? JSON.parse(fileContent) : {};
        } else {
            saveData(); // Cria o arquivo se não existir
        }
    } catch (error) {
        console.error('Erro ao carregar os dados:', error.message);
        gameData = {}; // Reverte para dados vazios em caso de erro
        saveData();
    }
}

// Função para salvar os dados no arquivo
function saveData() {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(gameData, null, 2), 'utf8');
    } catch (error) {
        console.error('Erro ao salvar os dados:', error.message);
    }
}

// Função para inicializar um usuário com dados padrão
function initializeUser(userId) {
    if (!gameData[userId]) {
        gameData[userId] = {
            coins: 0,
            inventory: {},
            stamina: MAX_ESTAMINA,
            lastInteraction: Date.now(),
        };
        saveData();
    }
}

// Função para recarregar a estamina de um usuário
function rechargeStamina(userId) {
    const user = gameData[userId];
    if (!user) return;

    const currentTime = Date.now();
    const timePassed = currentTime - user.lastInteraction;

    if (timePassed >= STAMINA_RECHARGE_TIME) {
        user.stamina = MAX_ESTAMINA;
        user.lastInteraction = currentTime;
        saveData();
    }
}

// Função para verificar se o usuário tem estamina suficiente
function hasSufficientStamina(userId) {
    const user = gameData[userId];
    return user && user.stamina > 0;
}

// Função para atualizar a estamina do usuário
function updateStamina(userId, newStamina) {
    const user = gameData[userId];
    if (user) {
        user.stamina = Math.max(0, Math.min(MAX_ESTAMINA, newStamina)); // Garante que a estamina esteja dentro do limite
        user.lastInteraction = Date.now();
        saveData();
    }
}

// Função para adicionar itens ao inventário do usuário
function addItemToInventory(userId, item, quantity) {
    const user = gameData[userId];
    if (user) {
        user.inventory[item] = (user.inventory[item] || 0) + quantity;
        saveData();
    }
}

// Função para calcular o tempo restante até o próximo evento
function getTimeRemaining(userId, intervalMs, format = true) {
    const user = gameData[userId];
    if (!user || !user.lastInteraction) return format ? 'Nenhuma atividade registrada.' : -1;

    const currentTime = Date.now();
    const timePassed = currentTime - user.lastInteraction;
    const timeRemaining = intervalMs - timePassed;

    if (format) {
        if (timeRemaining <= 0) return 'Já disponível!';
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s restantes.`;
    }

    return Math.max(0, timeRemaining); // Retorna o tempo restante em milissegundos
}

// Função para definir novos dados no sistema
function setGameData(newData) {
    if (typeof newData !== 'object' || newData === null) {
        console.error('Dados inválidos fornecidos para setGameData:', newData);
        return;
    }

    Object.entries(newData).forEach(([key, value]) => {
        gameData[key] = { ...(gameData[key] || {}), ...value };
    });

    saveData();
}

// Função para obter os dados de todos os usuários
function getGameData() {
    loadData(); // Garante que os dados estejam atualizados
    return gameData;
}

// Carrega os dados ao inicializar
loadData();

// Exporta as funções para uso externo
module.exports = {
    getGameData,
    setGameData,
    loadData,
    saveData,
    initializeUser,
    rechargeStamina,
    addItemToInventory,
    hasSufficientStamina,
    getTimeRemaining,
    updateStamina,
};
