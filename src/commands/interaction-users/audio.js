const { SlashCommandBuilder } = require('discord.js');
const {
    joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus,
} = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('audio')
        .setDescription('Toca um áudio específico de uma pasta na call (01 / 15')
        .addStringOption((option) => option.setName('audio')
            .setDescription('Escolha o áudio para tocar (sem extensão)')
            .setRequired(true)),

    async execute(interaction) {
        // Captura qualquer erro que ocorra durante a execução do comando
        try {
            const audioName = interaction.options.getString('audio');
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) {
                return interaction.reply({ content: 'Você precisa estar em um canal de voz para usar este comando!', ephemeral: true });
            }

            const audioFolderPath = path.join(__dirname, 'audios');
            if (!fs.existsSync(audioFolderPath)) {
                return interaction.reply({ content: 'A pasta de áudios não foi encontrada!', ephemeral: true });
            }

            // Lista as extensões de áudio que o bot suporta
            const supportedExtensions = ['.mp3', '.ogg', '.wav'];

            // Verifica se existe um arquivo com o nome fornecido + cada uma das extensões
            let audioPath = null;
            for (const ext of supportedExtensions) {
                const fullPath = path.join(audioFolderPath, audioName + ext);
                if (fs.existsSync(fullPath)) {
                    audioPath = fullPath;
                    break;
                }
            }

            if (!audioPath) {
                return interaction.reply({ content: `O áudio "${audioName}" não foi encontrado com as extensões suportadas!`, ephemeral: true });
            }

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
            });

            player.on('error', (error) => {
                console.error('Erro ao reproduzir o áudio:', error);
                interaction.followUp({ content: 'Houve um erro ao tentar reproduzir o áudio.', ephemeral: true });
                connection.destroy();
            });

            const resource = createAudioResource(audioPath);

            connection.subscribe(player);
            player.play(resource);
            await interaction.reply({ content: `Tocando o áudio: **${audioName}** no canal: **${voiceChannel.name}**`, ephemeral: true });
        } catch (error) {
            console.error('Erro no comando:', error);
            await interaction.reply({ content: 'Houve um erro ao tentar executar o comando. Tente novamente mais tarde.', ephemeral: true });
        }
    },
};
