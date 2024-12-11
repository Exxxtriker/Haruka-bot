const fs = require('fs');
const path = require('path');

// Função para ler as configurações de um arquivo JSON
function readConfig() {
    // Ajuste o caminho absoluto para o arquivo config.json
    const configPath = path.resolve(__dirname, '..', 'commands', 'presence.stream', 'config.json');

    if (fs.existsSync(configPath)) {
        try {
            const data = fs.readFileSync(configPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ Erro ao ler o arquivo config.json:', error.message);
            return {};
        }
    } else {
        console.error('❌ Arquivo config.json não encontrado no caminho:', configPath);
        return {};
    }
}

module.exports = { readConfig };
