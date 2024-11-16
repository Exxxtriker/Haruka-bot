const { Events } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const canal = client.channels.cache.get('1118565067127005185'); // coloque o ID do canal de voz

        try {
            joinVoiceChannel({
                channelId: canal.id,
                guildId: canal.guild.id,
                adapterCreator: canal.guild.voiceAdapterCreator,
            });
            console.log(`✅ Entrei no canal de voz [${canal.name}] com sucesso!`);
        } catch (e) {
            console.log(`❌ Não foi possível entrar no canal [ ${canal.name} ].`);
        }
    },
};
