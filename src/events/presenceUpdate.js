/* eslint-disable max-len */
const { Events, EmbedBuilder } = require('discord.js');
const { readConfig } = require('../utils/utils'); // Certifique-se de implementar essa função para ler a configuração de um arquivo JSON

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const { user } = newPresence;
        const guildId = newPresence.guild.id;

        // Verifica se o usuário está transmitindo (streaming)
        const stream = newPresence.activities.find((activity) => activity.type === 'STREAMING');

        if (stream) {
            // Lê as configurações do arquivo JSON
            const config = readConfig();
            const guildConfig = config[guildId];

            if (guildConfig) {
                const channel = newPresence.guild.channels.cache.get(guildConfig.canal);
                const role = channel.guild.roles.cache.get(guildConfig.cargo);

                if (channel && role) {
                    // Cria a embed com as informações da transmissão
                    const embed = new EmbedBuilder()
                        .setColor('#9146FF') // Cor do Twitch
                        .setTitle(`${user.username} está ao vivo!`)
                        .setURL(stream.url) // URL da transmissão
                        .setDescription(`Categoria: ${stream.name}`)
                        .addFields(
                            { name: 'Título da Stream:', value: stream.details || 'Sem título', inline: true },
                            { name: 'Visualizações:', value: 'Ao vivo agora', inline: true },
                        )
                        .setThumbnail(stream.largeImageURL) // Thumbnail da transmissão
                        .setTimestamp()
                        .setFooter({ text: 'Notificação ao vivo', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Twitch_logo_2011.svg/600px-Twitch_logo_2011.svg.png' });

                    // Envia a embed com o cargo mencionado
                    channel.send({
                        content: `${role} O usuário está ao vivo! Venham conferir a stream!`,
                        embeds: [embed],
                    });
                }
            }
        }
    },
};
