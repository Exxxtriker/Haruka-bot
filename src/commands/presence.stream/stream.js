/* eslint-disable max-len */
const { SlashCommandBuilder } = require('@discordjs/builders'); // Importando corretamente
const fs = require('fs');
const path = require('path');

// Função para ler o arquivo de configurações
function readConfig() {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {};
}

// Função para salvar as configurações no arquivo
function saveConfig(config) {
    const configPath = path.join(__dirname, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Comando para configurar o canal e o cargo
module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-live') // Nome do comando
        .setDescription('Configura o canal e o cargo para notificações de live')
        .addChannelOption((option) => option.setName('canal')
            .setDescription('Escolha o canal para enviar notificações de live')
            .setRequired(true))
        .addRoleOption((option) => option.setName('cargo')
            .setDescription('Escolha o cargo para ser mencionado nas notificações')
            .setRequired(true)),

    async execute(interaction) {
    // Verifica se o usuário tem permissão para configurar
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply('Você não tem permissão para configurar as notificações de live.');
        }

        const canal = interaction.options.getChannel('canal');
        const cargo = interaction.options.getRole('cargo');

        // Lê as configurações atuais do servidor
        const config = readConfig();
        const guildId = interaction.guild.id;

        // Atualiza as configurações do servidor
        if (!config[guildId]) {
            config[guildId] = {};
        }
        config[guildId].canal = canal.id;
        config[guildId].cargo = cargo.id;

        // Salva as novas configurações
        saveConfig(config);

        // Responde com a confirmação
        return interaction.reply(`Configurações atualizadas! As notificações de live serão enviadas para o canal ${canal} e o cargo ${cargo} será mencionado.`);
    },
};
