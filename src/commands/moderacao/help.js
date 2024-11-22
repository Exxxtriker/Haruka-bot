const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('*Veja todos os comandos da Haruka*'),
    async execute(interaction) {
        try {
            const { user, channel } = interaction;

            // Configurar botões com IDs únicos para a interação
            const pag02 = new ButtonBuilder()
                .setCustomId(`pag02-${interaction.id}`)
                .setLabel('Página 2')
                .setEmoji('📄')
                .setStyle(ButtonStyle.Primary);

            const pag01 = new ButtonBuilder()
                .setCustomId(`pag01-${interaction.id}`)
                .setLabel('Página 1')
                .setEmoji('📄')
                .setStyle(ButtonStyle.Primary);

            // Embed da página 1
            const pagina01 = new EmbedBuilder()
                .setTitle('☠️ **Comandos da Haruka Harano 運** (Página 1) ☠️')
                .setDescription('**Comandos disponíveis** - Requer permissão de administrador para alguns comandos.')
                .addFields(
                    { name: '༺═──────────═༻', value: '**🛡️ Comandos de Administração:**' },
                    { name: '/ban', value: '*Bane um usuário do servidor.* ☠️', inline: true },
                    { name: '/unban', value: '*Desbane um usuário.* 🛠️', inline: true },
                    { name: '/kick', value: '*Expulsa um membro do servidor.* 🚪', inline: true },
                    { name: '/anuncio', value: '*Envia um anúncio para o servidor.* 📣', inline: true },
                    { name: '/castigar', value: '*Coloca um usuário em castigo (timeout).* 🔇', inline: true },
                    { name: '\u200B', value: '\u200B' }, // Espaço entre categorias

                    { name: '**🎉 Comandos de Entretenimento:**', value: '\u200B' },
                    { name: '/hug', value: '*Dá um abraço em outro usuário.* 🤗', inline: true },
                    { name: '/kiss', value: '*Dá um beijo em alguém.* 💋', inline: true },
                    { name: '/punch', value: '*Dá um soco em alguém.* 👊🏼', inline: true },
                    { name: '/marry', value: '*Case-se com outro membro.* 👰🏼', inline: true },
                    { name: '/audio', value: '*Toca um áudio no canal de voz.* 🎵', inline: true },
                    { name: '/radio', value: '*Escute a rádio em tempo real do bot.* 🎵', inline: true },
                    { name: '/marco', value: '*Chama "POLLO"! 🏌️*', inline: true },
                    { name: '\u200B', value: '\u200B' }, // Espaço entre categorias

                    { name: '**📂 Comandos Diversos:**', value: '\u200B' },
                    { name: '/perfil', value: '*Mostra o perfil de um usuário.* 📜', inline: true },
                    { name: '/avatar', value: '*Exibe o avatar de um usuário.* 🖼️', inline: true },
                    { name: '/ping', value: '*Teste de latência do bot.* 🏓', inline: true },
                )
                .setColor('#000000')
                .setImage('https://i.gifer.com/Wntc.gif')
                .setTimestamp()
                .setFooter({
                    text: 'Haruka Harano 運',
                    iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                });

            const row = new ActionRowBuilder().addComponents(pag01, pag02);

            await interaction.reply({ embeds: [pagina01], components: [row], ephemeral: true });

            // Criar coletor exclusivo para a interação atual
            const collector = channel.createMessageComponentCollector({
                filter: (i) => i.customId.startsWith('pag') && i.user.id === user.id,
                time: 15 * 60 * 1000, // 15 minutos
            });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.customId === `pag02-${interaction.id}`) {
                    // Página 2
                    const pagina02 = new EmbedBuilder()
                        .setTitle('☠️ **Comandos da Haruka Harano 運** (Página 2) ☠️')
                        .setDescription('**Comandos de jogos:** - Fique atento às novidades! 🚧')
                        .addFields(

                            { name: '**🎮 Comandos de Minecraft:**', value: '\u200B' },
                            { name: '/mcstatus', value: '*Monitora o status de um servidor de Minecraft.* 🎮', inline: true },
                            { name: '\u200B', value: '\u200B' }, // Espaço entre categorias

                            { name: '📂 **Novos Comandos Planejados:**', value: '\u200B' },
                            { name: '(+)', value: '*Interações avançadas com ChatGPT.*', inline: true },
                            { name: '(+)', value: '*Ferramentas de geração de imagens.*', inline: true },
                            { name: '(+)', value: '*Melhorias em comandos de áudio.*', inline: true },
                        )
                        .setColor('#000000')
                        .setImage('https://i.gifer.com/Wntc.gif')
                        .setTimestamp()
                        .setFooter({
                            text: 'Haruka Harano 運',
                            iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                        });

                    await buttonInteraction.update({ embeds: [pagina02], components: [row], ephemeral: true });
                } else if (buttonInteraction.customId === `pag01-${interaction.id}`) {
                    // Voltar para a página 1
                    await buttonInteraction.update({ embeds: [pagina01], components: [row], ephemeral: true });
                }
            });

            collector.on('end', async () => {
                // Desativar os botões após o término
                pag01.setDisabled(true);
                pag02.setDisabled(true);
                const disabledRow = new ActionRowBuilder().addComponents(pag01, pag02);
                await interaction.editReply({ components: [disabledRow] }).catch(() => {});
            });
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: '❌ Ocorreu um erro ao executar o comando.',
                ephemeral: true,
            });
        }
    },
};
