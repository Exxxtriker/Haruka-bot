const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('audio')
        .setDescription('Toca um áudio específico de uma pasta na call.')
        .addStringOption(option =>
            option.setName('audio')
                .setDescription('Escolha o áudio para tocar (sem extensão)')
                .setRequired(true)),
    async execute(interaction) {
        // Obtém o nome do áudio fornecido pelo usuário (sem a extensão)
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

        player.on('error', error => {
            console.error('Erro ao reproduzir o áudio:', error);
            connection.destroy();
        });

        const resource = createAudioResource(audioPath);

        try {
            connection.subscribe(player);
            player.play(resource);
            await interaction.reply({ content: `Tocando o áudio: **${audioName}** no canal: **${voiceChannel.name}**`, ephemeral: true });
        } catch (error) {
            console.error('Erro ao tocar o áudio:', error);
            await interaction.reply({ content: 'Houve um erro ao tentar tocar o áudio.', ephemeral: true });
        }
    },
};
