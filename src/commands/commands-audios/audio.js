const {
    SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType,
} = require('discord.js');
const {
    joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus,
} = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

const isRadioActive = false; // Variable to track if radio is active

module.exports = {
    data: new SlashCommandBuilder()
        .setName('audio')
        .setDescription('Toca um áudio específico de uma pasta na call (01 / 27)')
        .setDMPermission(false),

    async execute(interaction) {
        try {
            if (isRadioActive) {
                return interaction.reply({ content: 'O comando /radio está ativo. Não é possível usar o comando /audio agora.', flags: 64 });
            }

            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) {
                return interaction.reply({ content: 'Você precisa estar em um canal de voz para usar este comando!', flags: 64 });
            }

            const audioFolderPath = path.join(__dirname, 'audios');
            if (!fs.existsSync(audioFolderPath)) {
                return interaction.reply({ content: 'A pasta de áudios não foi encontrada!', flags: 64 });
            }

            // Listar arquivos de áudio
            const supportedExtensions = ['.mp3', '.ogg', '.wav'];
            const files = fs.readdirSync(audioFolderPath)
                .filter((file) => supportedExtensions.includes(path.extname(file)));
            const audioNames = [...new Set(files.map((file) => path.basename(file, path.extname(file))))];

            if (audioNames.length === 0) {
                return interaction.reply({ content: 'Nenhum áudio encontrado na pasta!', flags: 64 });
            }

            // Criar select menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('audio_select')
                .setPlaceholder('Selecione um áudio para tocar')
                .addOptions(audioNames.slice(0, 25).map((name) => ({
                    label: name,
                    value: name,
                })));

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({
                content: 'Escolha um áudio para tocar:',
                components: [row],
                ephemeral: false,
            });

            // Coletor de interação do select menu (5 minutos, todos podem usar)
            const collector = interaction.channel.createMessageComponentCollector({
                message: (await interaction.fetchReply()),
                componentType: ComponentType.StringSelect,
                time: 5 * 60 * 1000, // 5 minutos
            });

            collector.on('collect', async (selectInteraction) => {
                const audioName = selectInteraction.values[0];
                const audioPath = supportedExtensions.map((ext) => path.join(audioFolderPath, audioName + ext))
                    .find((fullPath) => fs.existsSync(fullPath));
                if (!audioPath) {
                    return selectInteraction.reply({ content: `O áudio "${audioName}" não foi encontrado!`, ephemeral: true });
                }

                const connection = joinVoiceChannel({
                    channelId: selectInteraction.member.voice.channel.id,
                    guildId: selectInteraction.guild.id,
                    adapterCreator: selectInteraction.guild.voiceAdapterCreator,
                });

                const player = createAudioPlayer();

                player.on(AudioPlayerStatus.Idle, () => {
                    connection.destroy();
                });

                player.on('error', (error) => {
                    console.error('Erro ao reproduzir o áudio:', error);
                    selectInteraction.followUp({ content: 'Houve um erro ao tentar reproduzir o áudio.', ephemeral: true });
                    connection.destroy();
                });

                const resource = createAudioResource(audioPath);
                connection.subscribe(player);
                player.play(resource);
                // Envia mensagem ephemeral anunciando o áudio tocando, que se auto apaga em 10 segundos
                await selectInteraction.reply({
                    content: `Tocando o áudio: **${audioName}** no canal: **${selectInteraction.member.voice.channel.name}**`,
                    flags: 64,
                });
                setTimeout(async () => {
                    try {
                        await selectInteraction.deleteReply();
                    } catch (e) { /* Mensagem já deletada ou erro ignorado */ }
                }, 5000);
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    interaction.deleteReply();
                } else {
                    interaction.editReply({ components: [] });
                }
            });
        } catch (error) {
            console.error('Erro no comando:', error);
            await interaction.reply({ content: 'Houve um erro ao tentar executar o comando. Tente novamente mais tarde.', flags: 64 });
        }
    },
};
