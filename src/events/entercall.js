const { Events } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const canal = client.channels.cache.get('1118565067127005185'); // Substitua pelo ID do seu canal

        if (!canal || !canal.isVoiceBased()) return;

        let connection;

        const joinChannel = async () => {
            try {
                if (connection) {
                    // Remove os ouvintes antigos antes de criar uma nova conexão
                    connection.removeAllListeners();
                }

                connection = joinVoiceChannel({
                    channelId: canal.id,
                    guildId: canal.guild.id,
                    adapterCreator: canal.guild.voiceAdapterCreator,
                });

                // Ajusta o limite de ouvintes para evitar o aviso
                connection.setMaxListeners(20);

                // Adiciona ouvintes necessários apenas uma vez
                connection.on('error', (error) => {
                    // eslint-disable-next-line no-useless-return
                    if (error.message.includes('Cannot perform IP discovery')) return;
                });

                await entersState(connection, VoiceConnectionStatus.Ready, 30000); // Aguarda até 30 segundos para conectar
            } catch {
                setTimeout(joinChannel, 5000); // Tenta reconectar após 5 segundos
            }
        };

        // Inicia a conexão ao canal de voz
        joinChannel();

        // Escuta o evento de desconexão
        client.on(Events.VoiceStateUpdate, (oldState, newState) => {
            if (oldState.channelId === canal.id && newState.channelId === null) {
                setTimeout(joinChannel, 5000);
            }
        });

        // Monitora o estado da conexão
        if (connection) {
            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await entersState(connection, VoiceConnectionStatus.Connecting, 5000);
                } catch {
                    joinChannel();
                }
            });
        }
    },
};
