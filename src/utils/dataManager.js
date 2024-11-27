const fs = require('fs');
const path = require('path');
const { MAX_ESTAMINA, STAMINA_RECHARGE_TIME } = require('./config'); // Importando as configurações

// Caminho para o arquivo JSON onde os dados do jogo são armazenados
const itemsPath = path.join(__dirname, 'datagame.json');

// Variável para armazenar os dados carregados
let gameData = {};

// Função para carregar os dados do arquivo (executada no início e a cada consulta)
function loadData() {
    try {
        if (fs.existsSync(itemsPath)) {
            const fileContent = fs.readFileSync(itemsPath, 'utf8');
            if (fileContent.trim() !== '') {
                gameData = JSON.parse(fileContent); // Carrega os dados do arquivo
            } else {
                gameData = {}; // Garante que não fique "undefined" se o arquivo estiver vazio
            }
        } else {
            fs.writeFileSync(itemsPath, JSON.stringify(gameData, null, 2), 'utf8'); // Cria o arquivo se não existir
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Função para salvar os dados no arquivo
function saveData() {
    try {
        fs.writeFileSync(itemsPath, JSON.stringify(gameData, null, 2), 'utf8'); // Salva os dados mais recentes no arquivo
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

// Função para monitorar alterações e salvar automaticamente a cada modificação
function setGameData(newData) {
    for (const [key, value] of Object.entries(newData)) {
        if (!gameData[key]) {
            gameData[key] = value; // Adicionar novos dados
        } else {
            gameData[key] = { ...gameData[key], ...value }; // Atualizar dados existentes
        }
    }
    saveData(); // Salvar automaticamente após alteração
}

// Função para obter os dados do jogo
function getGameData() {
    loadData(); // Sempre carregar os dados mais recentes
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
        setGameData({ [userId]: gameData[userId] }); // Salvar dados iniciais
    }
}

// Função para recarregar estamina do usuário se necessário
function rechargeStamina(userId) {
    const user = gameData[userId];
    if (!user) return;

    const currentTime = Date.now();
    const timePassed = currentTime - user.lastMine;

    if (timePassed >= STAMINA_RECHARGE_TIME) {
        user.stamina = MAX_ESTAMINA;
        user.lastMine = currentTime;
        setGameData({ [userId]: user }); // Salvar estado atualizado
    }
}

// Função para adicionar itens ao inventário
function addItemToInventory(userId, item, quantity) {
    const user = gameData[userId];
    if (user) {
        user.inventory[item] = (user.inventory[item] || 0) + quantity;
        setGameData({ [userId]: user }); // Atualiza apenas os dados deste usuário
    }
}

function updateStamina(userId, newStamina) {
    const user = gameData[userId];
    if (user) {
        user.stamina = newStamina; // Atualiza o valor de estamina
        setGameData({ [userId]: user }); // Salvar estado atualizado
    }
}
// Função para verificar se o usuário tem estamina suficiente
function hasSufficientStamina(userId) {
    const user = gameData[userId];
    if (!user) return false;
    return user.stamina > 0;
}

// Função para calcular o tempo restante para recarga de estamina
function getTimeRemaining(userId, intervalMs) {
    const userData = gameData[userId];
    if (!userData || !userData.lastMine) {
        return 'Nenhuma atividade registrada.';
    }

    const currentTime = Date.now();
    const timePassed = currentTime - userData.lastMine;
    const timeRemaining = intervalMs - timePassed;

    if (timeRemaining <= 0) {
        return 'Já disponível!';
    }

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.ceil((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours} horas e ${minutes} minutos restantes.`;
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
