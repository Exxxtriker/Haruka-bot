const fs = require('fs');
const path = require('path');

// Função para ler as configurações de um arquivo JSON
function readConfig() {
    const configPath = path.join(__dirname, 'config.json'); // Certifique-se de que o caminho do arquivo JSON esteja correto
    if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath);
        return JSON.parse(data);
    }
    return {}; // Retorna um objeto vazio se o arquivo não for encontrado
}

module.exports = { readConfig };
