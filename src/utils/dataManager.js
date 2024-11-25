const fs = require('fs');
const path = require('path');

// Caminho do arquivo de dados
const itemsPath = path.join(__dirname, 'datagame.json');

// Cache de dados
let gameData = {};

// Função para carregar os dados (assíncrona)
async function loadData() {
    try {
        if (fs.existsSync(itemsPath)) {
            const fileContent = await fs.promises.readFile(itemsPath, 'utf8');
            if (fileContent.trim() === '') {
                gameData = {}; // Se o arquivo estiver vazio, inicializa o cache com um objeto vazio
            } else {
                gameData = JSON.parse(fileContent); // Tenta carregar o conteúdo JSON
            }
        } else {
            gameData = {}; // Se o arquivo não existir, inicializa o cache com um objeto vazio
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        gameData = {}; // Caso haja erro, inicializa o cache com um objeto vazio
    }
}

// Função para salvar os dados (assíncrona)
async function saveData() {
    try {
        await fs.promises.writeFile(itemsPath, JSON.stringify(gameData, null, 2));
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

// Função para obter os dados do jogo
async function getGameData() {
    await loadData(); // Carrega os dados sempre que for necessário
    return gameData;
}

// Função para definir os dados do jogo
async function setGameData(newData) {
    gameData = newData; // Atualiza o cache
    await saveData(); // Salva os dados atualizados
}

module.exports = { getGameData, setGameData };
