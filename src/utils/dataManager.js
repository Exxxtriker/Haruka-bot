const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, 'datagame.json');

let gameData = {};

// Função para carregar os dados do arquivo
function loadData() {
    try {
        if (fs.existsSync(itemsPath)) {
            const fileContent = fs.readFileSync(itemsPath, 'utf8');
            if (fileContent.trim() !== '') {
                gameData = JSON.parse(fileContent);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Função para salvar os dados no arquivo
function saveData() {
    try {
        // Salva os dados de volta no arquivo JSON
        fs.writeFileSync(itemsPath, JSON.stringify(gameData, null, 2));
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

// Função para manter os dados atualizados a cada 1 segundo
function autoSaveData() {
    setInterval(() => {
        // Carrega os dados e os salva a cada 1 segundo para garantir que nada fique para trás
        loadData();
        saveData();
    }, 1000); // 1 segundo
}

// Função para obter os dados do jogo
function getGameData() {
    loadData(); // Sempre carrega os dados antes de retornar
    return gameData;
}

// Função para atualizar os dados do jogo (somente o inventário)
function setGameData(newData) {
    // Atualiza o inventário somando os novos recursos ao já existente
    if (newData && newData.inventory) {
        // Se a chave inventory existir, somamos os valores minerados
        // eslint-disable-next-line guard-for-in
        for (const resource in newData.inventory) {
            gameData.inventory[resource] = (gameData.inventory[resource] || 0) + newData.inventory[resource];
        }
    }
    saveData(); // Atualiza o arquivo JSON com os dados novos
}

module.exports = { getGameData, setGameData, autoSaveData };
