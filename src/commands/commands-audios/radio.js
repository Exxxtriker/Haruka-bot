const { SlashCommandBuilder } = require('@discordjs/builders');
const {
    joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus,
} = require('@discordjs/voice');
const { spawn } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('radio')
        .setDescription('Conecta ao canal de voz e reproduz o áudio do desktop do host')
        .setDMPermission(false), // Desabilita o comando na DM

    async execute(interaction) {
        // Deferindo a resposta imediatamente
        await interaction.deferReply();

        if (interaction.user.id !== '335012394226941966') {
            return interaction.editReply('Você não tem permissão para usar este comando!');
        }

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.editReply('Você precisa estar em um canal de voz para usar este comando!');
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
                '-i', 'audio=CABLE Output (VB-Audio Virtual Cable)', // Instale o virtual cable
                '-ac', '2', // Número de canais (stereo)
                '-ar', '48000', // Taxa de amostragem (Discord usa 48kHz)
                '-c:a', 'libopus', // Codificação Opus
                '-f', 'opus', // Formato de saída Opus
                '-rtbufsize', '10M', // Tamanho do buffer ajustado
                '-loglevel', 'error', // Suprime tudo, exceto erros
                'pipe:1', // Saída para pipe
            ]);

            ffmpeg.on('close', (code) => {
                if (code !== 0) {
                    console.error(`FFmpeg processo finalizado com erro. Código de saída: ${code}`);
                } else {
                    console.log('FFmpeg processo finalizado com sucesso.');
                }
            });

            // Criar o recurso de áudio a partir da saída do FFmpeg
            const resource = createAudioResource(ffmpeg.stdout, { inlineVolume: true });

            // Criar o player de áudio e inscrever o player na conexão de voz
            const player = createAudioPlayer();
            connection.subscribe(player);

            // Reproduzir o recurso de áudio
            player.play(resource);

            await interaction.editReply(`Reproduzindo o áudio de "Haruka" no canal de voz: ${voiceChannel.name}`);

            player.on(AudioPlayerStatus.Idle, () => {
                console.log('Reprodução finalizada. Desconectando...');
                connection.destroy();
                ffmpeg.kill(); // Finaliza o processo do FFmpeg
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Ocorreu um erro ao tentar reproduzir o áudio.');
        }
    },
};
