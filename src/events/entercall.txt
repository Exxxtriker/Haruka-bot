const { Events } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const canal = client.channels.cache.get('1118565067127005185'); // coloque o ID do canal de voz

        const joinChannel = () => {
            const connection = joinVoiceChannel({
                channelId: canal.id,
                guildId: canal.guild.id,
                adapterCreator: canal.guild.voiceAdapterCreator,
            });

            connection.on(VoiceConnectionStatus.Ready, () => {
                // O bot entrou no canal de voz com sucesso
            });

            connection.on(VoiceConnectionStatus.Disconnected, (oldState, newState) => {
                // O bot foi desconectado do canal de voz, tenta reconectar
                if (newState.status === VoiceConnectionStatus.Disconnected) {
                    setTimeout(joinChannel, 5000); // Tenta reconectar após 5 segundos
                }
            });
        };

        // Tenta entrar no canal de voz ao iniciar
        joinChannel();

        // Escuta o evento de mudança de estado de voz
        client.on(Events.VoiceStateUpdate, (oldState, newState) => {
            // Verifica se o bot saiu do canal de voz
            if (oldState.channelId === canal.id && newState.channelId === null) {
                // O bot saiu do canal de voz, tenta reconectar
                setTimeout(joinChannel, 5000); // Tenta reconectar após 5 segundos
            }
        });
    },
};
