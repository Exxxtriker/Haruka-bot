const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const { spawn } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reproduzir_audio')
        .setDescription('Conecta ao canal de voz e reproduz o áudio da saída do sistema.'),

    async execute(interaction) {
        if (interaction.user.id !== '335012394226941966') {
            return interaction.reply('Você não tem permissão para usar este comando!');
        }
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('Você precisa estar em um canal de voz para usar este comando!');
        }

        try {
            // Conectar ao canal de voz
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log(`Conectado ao canal de voz: ${voiceChannel.name}`);
            });

            // Configuração do FFmpeg para capturar o áudio da saída do sistema
            const ffmpeg = spawn('ffmpeg', [
                '-f', 'dshow', // Dispositivo de captura de áudio
                '-i', 'audio=CABLE Output (VB-Audio Virtual Cable)', // Dispositivo de entrada de áudio
                '-ac', '2', // Número de canais (stereo)
                '-ar', '48000', // Taxa de amostragem (Discord usa 48kHz)
                '-c:a', 'libopus', // Codificação Opus
                '-f', 'opus', // Formato de saída Opus
                '-rtbufsize', '1500k', // Tamanho do buffer ajustado
                '-loglevel', 'error', // Suprime tudo, exceto erros
                'pipe:1', // Saída para pipe
            ]);

            // Suprime as mensagens de erro de "real-time buffer too full"
            ffmpeg.stderr.on('data', (data) => {
                const errorMessage = data.toString();
                // Filtra a mensagem específica de buffer cheio
                if (!errorMessage.includes('real-time buffer')) {
                    console.error(errorMessage); // Exibe outras mensagens de erro
                }
            });

            ffmpeg.on('close', (code) => {
                if (code !== 0) {
                    console.error(`FFmpeg processo finalizado com erro. Código de saída: ${code}`);
                } else {
                    console.log(`FFmpeg processo finalizado com sucesso.`);
                }
            });

            // Criar o recurso de áudio a partir da saída do FFmpeg
            const resource = createAudioResource(ffmpeg.stdout, { inlineVolume: true });

            // Criar o player de áudio e inscrever o player na conexão de voz
            const player = createAudioPlayer();
            connection.subscribe(player);

            // Reproduzir o recurso de áudio
            player.play(resource);

            await interaction.reply(`Reproduzindo o áudio de "ExxxtrikerJr" no canal de voz: ${voiceChannel.name}`);

            player.on(AudioPlayerStatus.Playing, () => {
            });

            player.on(AudioPlayerStatus.Idle, () => {
                console.log('Reprodução finalizada. Desconectando...');
                connection.destroy();
                ffmpeg.kill(); // Finaliza o processo do FFmpeg
            });
        } catch (error) {
            await interaction.reply('Ocorreu um erro ao tentar reproduzir o áudio.');
        }
    },
};
