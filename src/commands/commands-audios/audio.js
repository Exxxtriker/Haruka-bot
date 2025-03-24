const { SlashCommandBuilder } = require('discord.js');
const {
    joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus,
} = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

let isRadioActive = false; // Variable to track if radio is active

module.exports = {
    data: new SlashCommandBuilder()
        .setName('audio')
        .setDescription('Toca um áudio específico de uma pasta na call (01 / 23)')
        .addStringOption((option) => option.setName('audio')
            .setDescription('Escolha o áudio para tocar (sem extensão)')
            .setRequired(true))
        .setDMPermission(false),

    async execute(interaction) {
        try {
            if (isRadioActive) {
                return interaction.reply({ content: 'O comando /radio está ativo. Não é possível usar o comando /audio agora.', flags: 64 });
            }

            const audioName = interaction.options.getString('audio');
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) {
                return interaction.reply({ content: 'Você precisa estar em um canal de voz para usar este comando!', flags: 64 });
            }

            const audioFolderPath = path.join(__dirname, 'audios');
            if (!fs.existsSync(audioFolderPath)) {
                return interaction.reply({ content: 'A pasta de áudios não foi encontrada!', flags: 64 });
            }

            const supportedExtensions = ['.mp3', '.ogg', '.wav'];
            const audioPath = supportedExtensions.map((ext) => path.join(audioFolderPath, audioName + ext))
                .find((fullPath) => fs.existsSync(fullPath));

            if (!audioPath) {
                return interaction.reply({ content: `O áudio "${audioName}" não foi encontrado com as extensões suportadas!`, flags: 64 });
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
                interaction.followUp({ content: 'Houve um erro ao tentar reproduzir o áudio.', flags: 64 });
                connection.destroy();
            });

            const resource = createAudioResource(audioPath);

            connection.subscribe(player);
            player.play(resource);
            await interaction.reply({ content: `Tocando o áudio: **${audioName}** no canal: **${voiceChannel.name}**`, flags: 64 });
        } catch (error) {
            console.error('Erro no comando:', error);
            await interaction.reply({ content: 'Houve um erro ao tentar executar o comando. Tente novamente mais tarde.', flags: 64 });
        }
    },
};
