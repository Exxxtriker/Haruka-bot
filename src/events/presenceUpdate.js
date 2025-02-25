/* eslint-disable max-len */
const { Events, EmbedBuilder } = require('discord.js');
const { readConfig } = require('../utils/utilspresence'); // Ajuste o caminho para onde a função readConfig está localizada

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const { user } = newPresence;
        const guildId = newPresence.guild.id;

        // Verifica se o usuário está transmitindo (streaming)
        const stream = newPresence.activities.find((activity) => activity.type === 1); // Tipo 1 é STREAMING

        if (stream) {
            // Carrega a configuração do arquivo JSON
            const config = readConfig();

            // Obtém a configuração específica do servidor
            const guildConfig = config[guildId];
            if (!guildConfig) {
                return; // Configuração não encontrada, sai da função
            }

            // Busca o canal e o cargo especificados na configuração
            const channel = newPresence.guild.channels.cache.get(guildConfig.canal);
            const role = newPresence.guild.roles.cache.get(guildConfig.cargo);

            if (channel && role) {
                // Cria a embed com as informações da transmissão
                const streamUrl = stream.url || 'https://twitch.tv/';
                const largeImage = stream.assets?.largeImageURL; // Imagem grande da stream, se disponível

                // Verifica se largeImage é uma string válida
                const thumbnailUrl = typeof largeImage === 'string' ? largeImage : user.displayAvatarURL();

                const embed = new EmbedBuilder()
                    .setColor('#9146FF') // Cor do Twitch
                    .setTitle(`${user.displayName} está ao vivo!`)
                    .setURL(streamUrl) // URL da transmissão
                    .setDescription(`**Plataforma:** ${stream.name || 'Desconhecida'}\n**Título da Stream:** ${stream.details || 'Sem título'}\n**Duração:** ${stream.startTimestamp ? new Date(stream.startTimestamp).toLocaleTimeString() : '00:00'}\n**Jogo:** ${stream.state || 'Desconhecido'}`) // Adiciona o jogo ou categoria
                    .addFields(
                        { name: '🔗 Link da Stream', value: streamUrl, inline: true },
                        { name: '👁️ Espectadores', value: `${stream.viewerCount || '0'}`, inline: true },
                    )
                    .setThumbnail(thumbnailUrl); // Imagem ou avatar

                // Define a imagem grande apenas se for uma string válida
                if (typeof largeImage === 'string') {
                    embed.setImage(largeImage);
                }

                embed.setTimestamp()
                    .setFooter({
                        text: 'Notificação ao vivo',
                        iconURL: 'https://media.discordapp.net/attachments/1310325661839392889/1312064166277808138/0ef715af51d62dadfa1feaaa625b025c.png?ex=675af47a&is=6759a2fa&hm=a0e832326d0ac64fd57378ef71c029cf616041d0442e3a9febcceffc07824814&=&format=webp&quality=lossless&width=671&height=671',
                    });

                // Envia a embed com o cargo mencionado
                await channel.send({
                    content: `${role}`,
                    embeds: [embed],
                });
            }
        }
    },
};
