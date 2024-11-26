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

            // Botões de navegação
            const pag02 = new ButtonBuilder()
                .setCustomId(`pag02-${interaction.id}`)
                .setLabel('Página 2')
                .setEmoji('📄')
                .setStyle(ButtonStyle.Primary);

            const pag03 = new ButtonBuilder()
                .setCustomId(`pag03-${interaction.id}`)
                .setLabel('Página 3')
                .setEmoji('🎮')
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
                    { name: '**🛡️ Comandos de Administração:**', value: '\u200B' },
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

            // Embed para o Minigame
            const paginaMinigame = new EmbedBuilder()
                .setTitle('🎮 **Comandos do Minigame** 🎮')
                .setDescription('**Comandos exclusivos para o minigame**')
                .addFields(
                    { name: '**⚔️ Comandos de Combate:**', value: '\u200B' },
                    { name: '/combate', value: '*Lute contra um inimigo!* 🏆', inline: true },
                    { name: '**🛠️ Comandos de Forja:**', value: '\u200B' },
                    { name: '/forja', value: '*Forje novos equipamentos usando minerais!* 🔨', inline: true },
                    { name: '**📜 Comandos de Inventário:**', value: '\u200B' },
                    { name: '/inventario', value: '*Mostra o inventário do jogador.* 📦', inline: true },
                    { name: '**🏅 Comandos de Ranking:**', value: '\u200B' },
                    { name: '/leaderboard', value: '*Mostra o ranking de jogadores com mais moedas.* 🥇', inline: true },
                    { name: '**🌲 Comandos de Coleta:**', value: '\u200B' },
                    { name: '/lenhador', value: '*Colete madeira!* 🌳', inline: true },
                    { name: '/minerar', value: '*Minere para obter recursos!* ⛏️', inline: true },
                    { name: '**💰 Comandos de Comércio:**', value: '\u200B' },
                    { name: '/vender', value: '*Venda minérios para ganhar moedas.* 💸', inline: true },
                    { name: '/shop', value: '*Compre itens na loja.* 🛒', inline: true },
                )
                .setColor('#ffcc00')
                .setImage('https://i.gifer.com/Wntc.gif')
                .setTimestamp()
                .setFooter({
                    text: 'Haruka Harano 運',
                    iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                });

            const row = new ActionRowBuilder().addComponents(pag01, pag02, pag03);

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
                            { name: '/namemc', value: '*Busca o perfil de um jogador no NameMC.* 🎮', inline: true },
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
                } else if (buttonInteraction.customId === `pag03-${interaction.id}`) {
                    // Página Minigame
                    await buttonInteraction.update({ embeds: [paginaMinigame], components: [row], ephemeral: true });
                }
            });

            collector.on('end', async () => {
                // Desabilitar botões após o tempo limite
                pag01.setDisabled(true);
                pag02.setDisabled(true);
                pag03.setDisabled(true);
                const disabledRow = new ActionRowBuilder().addComponents(pag01, pag02, pag03);
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
