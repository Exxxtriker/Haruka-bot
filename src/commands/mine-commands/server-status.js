const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { status } = require('minecraft-server-util');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcstatus')
        .setDescription('Monitora o status de um servidor de Minecraft.')
        .addStringOption((option) => option.setName('ip')
            .setDescription('O IP do servidor de Minecraft.')
            .setRequired(true))
        .addIntegerOption((option) => option.setName('porta')
            .setDescription('A porta do servidor (padrão: 25565).'))
        .setDMPermission(false),
    async execute(interaction) {
        const ip = interaction.options.getString('ip');
        const port = interaction.options.getInteger('porta') || 25565;

        await interaction.deferReply();

        try {
            const serverStatus = await status(ip, port);
            const iconPath = path.join(__dirname, 'imagens', 'server-icon.png');
            const iconExists = fs.existsSync(iconPath);

            let playersOnline = 'Jogadores não disponíveis';
            if (serverStatus.players.list && serverStatus.players.list.length > 0) {
                playersOnline = serverStatus.players.list.join(', ');
            } else if (serverStatus.players.online > 0) {
                playersOnline = 'Jogadores visíveis não disponíveis';
            }

            const isCracked = serverStatus.motd.clean.includes('Cracked') || serverStatus.version.name.includes('Cracked');

            const embed = new EmbedBuilder()
                .setTitle(`Status do Servidor: ${ip}`)
                .setColor(0x5fb041)
                .setThumbnail('attachment://server-icon.png')
                .addFields(
                    { name: 'IP 📡', value: ip, inline: true },
                    { name: 'Porta 🔌', value: `${port}`, inline: false },
                    { name: 'Tipo de Conta 🔑', value: isCracked ? 'Pirata (Cracked)' : 'Original', inline: false },
                    { name: 'Versão 📋', value: serverStatus.version.name, inline: true },
                    { name: 'Jogadores Online 👥', value: `${serverStatus.players.online}/${serverStatus.players.max}`, inline: true },
                    { name: '👾 Jogadores', value: playersOnline, inline: false },
                    { name: '🗺️ Motd', value: serverStatus.motd.clean || 'Sem mensagem do dia', inline: false },
                )
                .setTimestamp()
                .setFooter({
                    text: 'Haruka Harano 運',
                    iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                });

            const attachment = iconExists ? { files: [{ attachment: iconPath, name: 'server-icon.png' }] } : {};

            return interaction.editReply({
                embeds: [embed],
                ...attachment,
            });
        } catch (error) {
            console.error(error);
            return interaction.editReply({
                content: '❌ Não foi possível obter informações do servidor. Verifique o IP e a porta.',
                flags: 64,
            });
        }
    },
};
