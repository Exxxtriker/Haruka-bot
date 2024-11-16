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
            const collector = interaction.channel.createMessageComponentCollector({ time: 1000000 });
            const pag02 = new ButtonBuilder()
                .setCustomId('pag02')
                .setLabel('Pagina 2')
                .setEmoji('1142826291347849397')
                .setStyle(ButtonStyle.Success);
            const pag01 = new ButtonBuilder()
                .setCustomId('pag01')
                .setLabel('Pagina 1')
                .setEmoji('1142826285639401612')
                .setStyle(ButtonStyle.Success);
            const pagina01 = new EmbedBuilder()
                .setTitle('☠️ Comandos da Haruka Harano 運 (Pag 01) ☠️')
                .setDescription('Comandos da moderação requerem que o bot tenha o cargo de (Administrator)')
                .addFields(
                    { name: '\n', value: '༺═────────────────────────────═༻' },
                    { name: '\n', value: '\n' },
                    { name: '**Comandos da Administração 🛸⚠️**', value: '\n' },
                    { name: '/ban', value: '*Use para banir alguem ☠️*', inline: true },
                    { name: '/help', value: '*Exibe esta mensagem 🎸*', inline: true },
                    { name: '/unban', value: '*Desbane um usuario 🫂*', inline: true },
                    { name: '/kick', value: '*Expulse alguém 🫂*', inline: true },
                    { name: '/anuncio', value: '*Confeccionar um anúncio ao servidor 📣*', inline: true },
                    { name: '\n', value: '༺═────────────────────────────═༻' },
                )
                .addFields(
                    { name: '\n', value: '\n' },
                    { name: '**Comandos de entreterimento 📣🎊**', value: '\n' },
                    { name: '/hug', value: '*Abrace alguém 🫂*', inline: true },
                    { name: '/kiss', value: '*Beije alguém 👄*', inline: true },
                    { name: '/punch', value: '*Bata em alguém 👊🏼*', inline: true },
                    { name: '/marry', value: '*Case-se com alguem 👰🏼*', inline: true },
                    { name: '/audio', value: '*Toca um áudio específico de uma pasta na call. 🎵*', inline: true },
                    { name: '/duvida', value: '*Tire sua duvida com alguém 📝*', inline: true },
                    { name: '/perfil', value: '*Exibe informações de um usuário 📝*', inline: true },
                    { name: '/avatar', value: '*Exibe o avatar de um usuário e oferece um botão para baixá-lo. ☀️*', inline: true },
                    { name: '/marco', value: '*POLLO 🏌🏼*', inline: true },
                    { name: '/ping', value: '*Jogue ping pong 🏓*', inline: true },
                    { name: '/proibido', value: '*Marque a pessoa que proibe a diversão ⚠️*', inline: true },
                    { name: '/sadness', value: '*Utilize quando não aguentar mais o server 🔫*', inline: true },
                )
                .setColor('000000')
                .setImage('https://i.gifer.com/Wntc.gif')
                .setTimestamp()
                .setFooter({
                    text: 'Haruka Harano 運',
                    iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png'
                });

            const row = new ActionRowBuilder()
                .addComponents(pag01, pag02);

            await interaction.reply({ embeds: [pagina01], components: [row], ephemeral: true });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.customId === 'pag02') {
                    // Handle button click for page 2
                    const pagina2 = new EmbedBuilder()
                        .setTitle('☠️ Comandos da Haruka Harano 運 (Pag 02) ☠️')
                        .setDescription('Em construção 🚧👷🏼🏗️ ')
                        .addFields(
                            { name: '**Comandos que estão vindo**', value: '\n' },
                            { name: '** (+) = Comandos de interação **', value: '\n' },
                            { name: '** (!) = Comandos de Música **', value: '\n' },
                            { name: '** (!) = Comandos de integrados ao ChatGPT **', value: '\n' },
                            { name: '** (!) = Comandos de SRC de imagens **', value: '\n' },
                            { name: '\u200B', value: '\u200B' },
                            { name: '** Tradução dos sinais **', value: '\n' },
                            { name: '** ( ! ) = "comandos (NÃO) sendo feitos ainda"\n ( + ) = "comandos sendo feitos"\n **', value: '\n' },
                        )
                        .setColor('000000')
                        .setImage('https://i.gifer.com/Wntc.gif')
                        .setTimestamp()
                        .setFooter({
                            text: 'Haruka Harano 運',
                            iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                        });

                    const rowb = new ActionRowBuilder()
                        .addComponents(pag01, pag02);

                    await buttonInteraction.update({ embeds: [pagina2], components: [rowb], ephemeral: true });
                } else if (buttonInteraction.customId === 'pag01') {
                    await buttonInteraction.update({ embeds: [pagina01], components: [row], ephemeral: true });
                }
                collector.on('end', (collected) => {
                    console.log(`Collector ended. Collected ${collected.size} interactions.`);
                });
            });
        } catch (error) {
            console.error(error);
        }
    },
};
