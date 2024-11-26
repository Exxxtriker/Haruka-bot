const fs = require('fs');
const path = require('path');

// Caminho para o arquivo JSON onde os dados do jogo são armazenados
const itemsPath = path.join(__dirname, 'datagame.json'); // Certifique-se de que o caminho esteja correto

let gameData = {};

// Função para carregar os dados do arquivo
function loadData() {
    try {
        if (fs.existsSync(itemsPath)) {
            const fileContent = fs.readFileSync(itemsPath, 'utf8');
            if (fileContent.trim() !== '') {
                gameData = JSON.parse(fileContent); // Carrega os dados do arquivo
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Função para salvar os dados no arquivo
function saveData() {
    try {
        fs.writeFileSync(itemsPath, JSON.stringify(gameData, null, 2), 'utf8'); // Atualiza o arquivo com os dados mais recentes
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

// Função para manter os dados atualizados a cada 1 segundo
function autoSaveData() {
    setInterval(() => {
        loadData(); // Carrega os dados antes de salvar
        saveData(); // Atualiza o arquivo com os dados mais recentes
    }, 1000); // Atualização a cada 1 segundo
}

// Função para obter os dados do jogo
function getGameData() {
    loadData(); // Carrega os dados toda vez que for necessário acessá-los
    return gameData;
}

// Função para atualizar os dados do jogo
function setGameData(newData) {
    gameData = { ...gameData, ...newData }; // Atualiza os dados do jogo com os novos dados
    saveData(); // Salva os dados atualizados no arquivo
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

module.exports = {
    getGameData,
    setGameData,
    autoSaveData,
    getTimeRemaining,
};
