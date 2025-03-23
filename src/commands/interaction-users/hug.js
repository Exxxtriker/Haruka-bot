/* eslint-disable max-len */
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');

const hugImages = [
    'https://media.tenor.com/J7eGDvGeP9IAAAAC/enage-kiss-anime-hug.gif',
    'https://media.tenor.com/FgLRE4gi5VoAAAAC/hugs-cute.gif',
    'https://media.tenor.com/pqXmHpbIy0MAAAAd/anime-anime-hug.gif',
    'https://media.tenor.com/RR4YJdzCJRMAAAAd/chainsaw-man-hug.gif',
    'https://media.tenor.com/My2v_lTI3LIAAAAC/hug-anime.gif',
    'https://media.tenor.com/2VVGNLi-EV4AAAAC/anime-cute.gif',
    'https://media.tenor.com/ann8bhGuneoAAAAC/hug-hugging.gif',
    // Adicione mais URLs conforme necessário
];
const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('*Marque a pessoa que você quer abraçar*')
        .addUserOption((option) => option
            .setName('alvo')
            .setDescription('Marque a pessoa que você deseja abraçar')
            .setRequired(true))
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        try {
            const { user } = interaction;
            const targetUser = interaction.options.getUser('alvo');

            // Gerenciar cooldown
            if (cooldowns.has(user.id)) {
                const expirationTime = cooldowns.get(user.id);
                if (Date.now() < expirationTime) {
                    const remainingTime = ((expirationTime - Date.now()) / 1000).toFixed(1);
                    return interaction.reply({
                        content: `❌ Você está em cooldown. Por favor, espere mais ${remainingTime} segundos.`,
                        flags: 64,
                    });
                }
            }

            // Resetar cooldown
            cooldowns.delete(user.id);

            // Configuração do embed e botões
            const aceita = new ButtonBuilder()
                .setCustomId(`aceita-${interaction.id}`) // ID único para evitar conflitos
                .setLabel('Retribuir')
                .setStyle(ButtonStyle.Success);

            const randomImageUrl = hugImages[Math.floor(Math.random() * hugImages.length)];

            const embed = new EmbedBuilder()
                .setTitle('🫂 Momento Afeto 🫂')
                .setDescription(`${user} lançou um baita abraço em ${targetUser}\n（づ￣3￣）づ`)
                .setColor('701198')
                .setImage(randomImageUrl)
                .setTimestamp()
                .setFooter({
                    text: 'Haruka Harano 運',
                    iconURL: 'https://media.discordapp.net/attachments/1310325661839392889/1312064166277808138/0ef715af51d62dadfa1feaaa625b025c.png?ex=675b9d3a&is=675a4bba&hm=5b253e7becc2b400f4a260e923a662beb1da7cb34df7c4c952e7468a14ad2744&=&format=webp&quality=lossless&width=427&height=427',
                });

            const row = new ActionRowBuilder().addComponents(aceita);

            // Responder ao comando
            await interaction.reply({
                embeds: [embed],
                components: [row],
                content: `${targetUser}`,
            });

            // Configuração do coletor
            const filter = (i) => i.customId === `aceita-${interaction.id}` && i.user.id === targetUser.id;
            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: 15 * 60 * 1000,
            });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.customId === `aceita-${interaction.id}`) {
                    const randomHugImage = hugImages[Math.floor(Math.random() * hugImages.length)];

                    const aceitarEmbed = new EmbedBuilder()
                        .setTitle('🫂 Momento Íntimo 🫂')
                        .setDescription(`${targetUser} retribuiu o abraço com outro abraço em ${user}!\nヽ(￣ω￣(￣ω￣〃)ゝ`)
                        .setImage(randomHugImage)
                        .setColor('701198')
                        .setTimestamp()
                        .setFooter({
                            text: 'Haruka Harano 運',
                            iconURL: 'https://media.discordapp.net/attachments/1310325661839392889/1312064166277808138/0ef715af51d62dadfa1feaaa625b025c.png?ex=675b9d3a&is=675a4bba&hm=5b253e7becc2b400f4a260e923a662beb1da7cb34df7c4c952e7468a14ad2744&=&format=webp&quality=lossless&width=427&height=427',
                        });

                    await buttonInteraction.reply({ embeds: [aceitarEmbed], content: `${user}` });

                    // Desabilitar o botão após o uso
                    aceita.setDisabled(true);
                    await interaction.editReply({ components: [row] });
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                // Desabilitar botões após expiração do tempo
                aceita.setDisabled(true);
                await interaction.editReply({ components: [row] }).catch(() => null);
            });

            // Aplicar cooldown
            cooldowns.set(user.id, Date.now() + 15 * 1000); // 15 segundos
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: '❌ Ocorreu um erro ao executar o comando.',
                flags: 64,
            });
        }
    },
};
