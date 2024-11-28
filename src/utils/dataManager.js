/* eslint-disable no-use-before-define */
const fs = require('fs');
const path = require('path');
const { MAX_ESTAMINA, STAMINA_RECHARGE_TIME } = require('./config'); // Importando as configurações

// Caminho para o arquivo JSON onde os dados do jogo são armazenados
const itemsPath = path.join(__dirname, 'datagame.json');

// Variável para armazenar os dados carregados
let gameData = {};

// Função para carregar os dados do arquivo
function loadData() {
    try {
        if (fs.existsSync(itemsPath)) {
            const fileContent = fs.readFileSync(itemsPath, 'utf8');
            // Se o conteúdo não estiver vazio, tenta parsear
            if (fileContent.trim() !== '') {
                gameData = JSON.parse(fileContent);
            } else {
                gameData = {}; // Garante que a variável gameData não fique indefinida
            }
        } else {
            // Se o arquivo não existe, cria um arquivo inicial
            saveData();
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error.message);
        gameData = {}; // Em caso de erro, recria a estrutura de dados vazia
        saveData(); // Salva os dados vazios
    }
}

// Função para salvar os dados no arquivo
function saveData() {
    try {
        fs.writeFileSync(itemsPath, JSON.stringify(gameData, null, 2), 'utf8');
    } catch (error) {
        console.error('Erro ao salvar dados:', error.message);
    }
}

// Função para monitorar alterações e salvar automaticamente
function setGameData(newData) {
    if (typeof newData !== 'object' || newData === null) {
        console.error('Dados inválidos fornecidos a setGameData:', newData);
        return;
    }

    for (const [key, value] of Object.entries(newData)) {
        if (!gameData[key]) {
            gameData[key] = value; // Adiciona novos dados
        } else {
            gameData[key] = { ...gameData[key], ...value }; // Atualiza dados existentes
        }
    }
    saveData(); // Salva automaticamente após a alteração
}

// Função para obter os dados do jogo
function getGameData() {
    loadData(); // Carrega os dados mais recentes
    return gameData;
}

// Função para inicializar o usuário com dados padrão
function initializeUser(userId) {
    if (!gameData[userId]) {
        gameData[userId] = {
            coins: 0,
            inventory: {},
            stamina: MAX_ESTAMINA,
            lastMine: 0,
        };
        setGameData({ [userId]: gameData[userId] }); // Salva dados iniciais
    }
}

// Função para recarregar estamina do usuário, se necessário
function rechargeStamina(userId) {
    const user = gameData[userId];
    if (!user || !user.lastMine) return; // Verifica se o usuário existe e se tem uma última atividade registrada

    const currentTime = Date.now();
    const timePassed = currentTime - user.lastMine;

    if (timePassed >= STAMINA_RECHARGE_TIME) {
        user.stamina = MAX_ESTAMINA;
        user.lastMine = currentTime;
        setGameData({ [userId]: user }); // Salva a atualização
    }
}

// Função para adicionar itens ao inventário do usuário
function addItemToInventory(userId, item, quantity) {
    const user = gameData[userId];
    if (user) {
        user.inventory[item] = (user.inventory[item] || 0) + quantity;
        setGameData({ [userId]: user }); // Atualiza os dados do usuário
    }
}

// Função para atualizar a estamina do usuário
function updateStamina(userId, newStamina) {
    const user = gameData[userId];
    if (user) {
        user.stamina = Math.max(0, Math.min(MAX_ESTAMINA, newStamina)); // Garante que a estamina esteja dentro dos limites
        setGameData({ [userId]: user }); // Salva a atualização
    }
}

// Função para verificar se o usuário tem estamina suficiente
function hasSufficientStamina(userId) {
    const user = gameData[userId];
    if (!user) return false;
    return user.stamina > 0;
}

function getTimeRemaining(userId, intervalMs, format = true) {
    const userData = gameData[userId];
    if (!userData || !userData.lastMine) return format ? 'Nenhuma atividade registrada.' : -1;

    const currentTime = Date.now();
    const timePassed = currentTime - userData.lastMine;
    const timeRemaining = intervalMs - timePassed;

    if (format) {
        if (timeRemaining <= 0) return 'Já disponível!';
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s restantes.`;
    }

    return Math.max(0, timeRemaining); // Em milissegundos
}
// Garantir que os dados sejam carregados ao iniciar o bot
loadData();

// Exporta todas as funções para uso no restante do código
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
