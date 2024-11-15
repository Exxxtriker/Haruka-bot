const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const path = require('path');
const fs = require('fs'); // Para verificar se o arquivo existe

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play-audio')
        .setDescription('Faz o bot entrar na call e tocar um áudio.')
        .addStringOption(option =>
            option.setName('arquivo')
                .setDescription('Nome do arquivo de áudio para tocar (sem extensão)')
                .setRequired(true)),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        // Verifica se o usuário está em um canal de voz
        if (!voiceChannel) {
            return interaction.reply({ content: 'Você precisa estar em um canal de voz para usar este comando!', ephemeral: true });
        }

        const audioFile = interaction.options.getString('arquivo');
        const filePath = path.join(__dirname, 'audios', `${audioFile}.mp3`);

        // Verifica se o arquivo de áudio existe
        if (!fs.existsSync(filePath)) {
            return interaction.reply({ content: `O arquivo **${audioFile}.mp3** não foi encontrado na pasta \`audios\`.`, ephemeral: true });
        }

        try {
            // Conecta ao canal de voz
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            // Aguardar até a conexão ser estabelecida
            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('Conexão com o canal de voz estabelecida!');
            });

            connection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log('Desconectado do canal de voz.');
            });

            // Cria o player de áudio
            const player = createAudioPlayer();

            // Cria o recurso de áudio a partir do arquivo
            const resource = createAudioResource(filePath, {
                inputType: AudioPlayerStatus.Idle, // Garante o tipo correto de entrada
            });

            // Log de status do player
            player.on('stateChange', (oldState, newState) => {
                console.log(`Estado do player mudou: ${oldState.status} -> ${newState.status}`);
            });

            // Reproduz o áudio
            player.play(resource);
            connection.subscribe(player);

            // Cria a embed com informações do áudio
            const embed = {
                color: 0x0099ff,
                title: '🎶 Música Tocando',
                description: `Agora tocando: **${audioFile}**`,
                footer: {
                    text: 'Bot de música',
                },
                timestamp: new Date(),
            };

            // Notifica no chat com a embed efêmera
            await interaction.reply({ embeds: [embed], ephemeral: true });

            // Configura o evento quando a música terminar
            player.on(AudioPlayerStatus.Idle, () => {
                console.log(`A música **${audioFile}** terminou de tocar.`);
                connection.destroy();
                interaction.followUp({ content: `✅ A música **${audioFile}** terminou de tocar!`, ephemeral: true });
            });

            // Em caso de erro durante a reprodução do áudio
            player.on('error', (error) => {
                console.error('Erro ao tocar o áudio:', error);
                connection.destroy();
                interaction.followUp({ content: '❌ Ocorreu um erro durante a reprodução do áudio.', ephemeral: true });
            });
        } catch (error) {
            console.error('Erro geral ao tentar tocar o áudio:', error);
            interaction.reply({ content: '❌ Ocorreu um erro ao tentar tocar o áudio. Verifique os logs.', ephemeral: true });
        }
    },
};
