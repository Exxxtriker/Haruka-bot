const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

function readConfig() {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {};
}

function saveConfig(config) {
    const configPath = path.join(__dirname, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remover-config-live')
        .setDescription('Remove a configuração de notificações de live deste servidor')
        .setDMPermission(false),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'Você não tem permissão para remover as configurações de live.',
                Flags: 64,
            });
        }

        const config = readConfig();
        const guildId = interaction.guild.id;

        if (config[guildId]) {
            delete config[guildId];
            saveConfig(config);

            return interaction.reply({
                content: 'As configurações de live foram removidas com sucesso para este servidor.',
                Flags: 64,
            });
        }
        return interaction.reply({
            content: 'Nenhuma configuração de live encontrada para este servidor.',
            Flags: 64,
        });
    },
};
