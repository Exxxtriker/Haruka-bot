const {
    SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder,
} = require('discord.js');
const {
    joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus,
} = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('audio')
        .setDescription('Toca um áudio do diretório de áudios no canal de voz.')
        .setDMPermission(false),

    async execute(interaction) {
        try {
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

            // Paginação do select menu
            const pageSize = 25;
            let page = 0;
            const getPageOptions = (currentPage) => audioNames.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((name) => ({
                label: name,
                value: name,
                emoji: '☠️',
            }));

            const { ButtonBuilder, ButtonStyle } = require('discord.js');
            const getRow = () => {
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`audio_select_${page}`)
                    .setPlaceholder(`Selecione um áudio para tocar (página ${page + 1}/${Math.ceil(audioNames.length / pageSize)})`)
                    .addOptions(getPageOptions(page));
                const buttons = [];
                if (page > 0) {
                    buttons.push(
                        new ButtonBuilder()
                            .setCustomId('prev_page')
                            .setLabel('Anterior')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('⬅️'),
                    );
                }
                if ((page + 1) * pageSize < audioNames.length) {
                    buttons.push(
                        new ButtonBuilder()
                            .setCustomId('next_page')
                            .setLabel('Próxima')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('➡️'),
                    );
                }
                const row = new ActionRowBuilder().addComponents(selectMenu);
                if (buttons.length > 0) {
                    const btnRow = new ActionRowBuilder().addComponents(...buttons);
                    return [row, btnRow];
                }
                return [row];
            };

            await interaction.reply({
                embeds: [{
                    image: { url: 'https://i.pinimg.com/originals/32/d9/bd/32d9bd9064b63d40523415cbcfa3f510.gif' },
                    color: 0x2f3136,
                }],
                content: 'Escolha um áudio para tocar:',
                components: getRow(page),
            });

            // Coletor de interação do select menu e botões (5 minutos, todos podem usar)
            const collector = interaction.channel.createMessageComponentCollector({
                message: (await interaction.fetchReply()),
                time: 5 * 60 * 1000, // 5 minutos
            });

            collector.on('collect', async (componentInteraction) => {
                if (componentInteraction.isStringSelectMenu()) {
                    const audioName = componentInteraction.values[0];
                    const audioPath = supportedExtensions.map((ext) => path.join(audioFolderPath, audioName + ext))
                        .find((fullPath) => fs.existsSync(fullPath));
                    if (!audioPath) {
                        return componentInteraction.reply({ content: `O áudio "${audioName}" não foi encontrado!`, ephemeral: true });
                    }

                    const connection = joinVoiceChannel({
                        channelId: componentInteraction.member.voice.channel.id,
                        guildId: componentInteraction.guild.id,
                        adapterCreator: componentInteraction.guild.voiceAdapterCreator,
                    });

                    const player = createAudioPlayer();

                    player.on(AudioPlayerStatus.Idle, () => {
                        connection.destroy();
                    });

                    player.on('error', (error) => {
                        console.error('Erro ao reproduzir o áudio:', error);
                        componentInteraction.followUp({ content: 'Houve um erro ao tentar reproduzir o áudio.', ephemeral: true });
                        connection.destroy();
                    });

                    const resource = createAudioResource(audioPath);
                    connection.subscribe(player);
                    player.play(resource);
                    // Envia mensagem ephemeral anunciando o áudio tocando, que se auto apaga em 10 segundos
                    await componentInteraction.reply({
                        content: `Tocando o áudio: **${audioName}** no canal: **${componentInteraction.member.voice.channel.name}**`,
                        flags: 64,
                    });
                    setTimeout(async () => {
                        try {
                            await componentInteraction.deleteReply();
                        } catch (e) { /* Mensagem já deletada ou erro ignorado */ }
                    }, 5000);
                } else if (componentInteraction.isButton()) {
                    if (componentInteraction.customId === 'next_page') {
                        page += 1;
                        await componentInteraction.update({
                            components: getRow(page),
                        });
                    } else if (componentInteraction.customId === 'prev_page') {
                        page -= 1;
                        await componentInteraction.update({
                            components: getRow(page),
                        });
                    }
                }
            });

            collector.on('end', async () => {
                try {
                    await interaction.deleteReply(); // Apaga texto e menu sempre
                } catch (e) {
                    // Ignora erro de mensagem desconhecida/deletada
                }
            });
        } catch (error) {
            console.error('Erro no comando:', error);
            await interaction.reply({ content: 'Houve um erro ao tentar executar o comando. Tente novamente mais tarde.', flags: 64 });
        }
    },
};
