const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');

const kissImages = [
    'https://media.tenor.com/6I89xfrC8iQAAAAC/anime-beijo-couple.gif',
    'https://media.tenor.com/Ogthkl9rYBMAAAAC/ichigo-hiro.gif',
    'https://media.tenor.com/2MZgbU7fxrUAAAAd/tomo-chan-is-a-girl-kiss-anime.gif',
    'https://media.tenor.com/dn_KuOESmUYAAAAC/engage-kiss-anime-kiss.gif',
    'https://media.tenor.com/yY5RfqCmfM0AAAAd/muppets-kermit.gif',
    'https://media.tenor.com/F02Ep3b2jJgAAAAC/cute-kawai.gif',
    // Adicione mais URLs conforme necessário
];
const kissImages2 = [
    'https://media.tenor.com/yY5RfqCmfM0AAAAd/muppets-kermit.gif',
    'https://media.tenor.com/6I89xfrC8iQAAAAC/anime-beijo-couple.gif',
    'https://media.tenor.com/Ogthkl9rYBMAAAAC/ichigo-hiro.gif',
    'https://media.tenor.com/F02Ep3b2jJgAAAAC/cute-kawai.gif',
    'https://media.tenor.com/2MZgbU7fxrUAAAAd/tomo-chan-is-a-girl-kiss-anime.gif',
    'https://media.tenor.com/dn_KuOESmUYAAAAC/engage-kiss-anime-kiss.gif',
];
const collectors = {};
const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('*Marque a pessoa que você quer beijar*')
        .addUserOption((option) => option.setName('alvo')
            .setDescription('Marque a pessoa que você deseja')
            .setRequired(true))
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        try {
            const { user, channel } = interaction;
            const targetUser = interaction.options.getUser('alvo');

            // Verificar cooldown
            if (cooldowns.has(user.id)) {
                const expirationTime = cooldowns.get(user.id);
                if (Date.now() < expirationTime) {
                    const remainingTime = ((expirationTime - Date.now()) / 1000).toFixed(1);
                    return interaction.reply({
                        content: `❌ Você está em cooldown. Por favor, espere mais ${remainingTime} segundos.`,
                        ephemeral: true,
                    });
                }
                cooldowns.delete(user.id);
            }

            // Configurar botão
            const aceita = new ButtonBuilder()
                .setCustomId(`accept-${interaction.id}`) // ID único para a interação
                .setLabel('Retribuir')
                .setStyle(ButtonStyle.Success);

            // Selecionar imagens
            const randomImageUrl = kissImages[Math.floor(Math.random() * kissImages.length)];
            const randomImageUrl2 = kissImages2[Math.floor(Math.random() * kissImages2.length)];

            // Criar embed inicial
            const embed = new EmbedBuilder()
                .setTitle('💋 Big Beijo 💋')
                .setDescription(`${user} lançou um beijo em ${targetUser}\nヽ(*￣▽￣*)ノミ|Ю`)
                .setColor('701198')
                .setImage(randomImageUrl)
                .setTimestamp()
                .setFooter({
                    text: 'Haruka Harano 運',
                    iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                });

            const row = new ActionRowBuilder().addComponents(aceita);

            // Responder ao comando
            await interaction.reply({ embeds: [embed], components: [row] });

            // Criar coletor exclusivo para a interação
            const collector = channel.createMessageComponentCollector({
                filter: (i) => i.customId === `accept-${interaction.id}` && i.user.id === targetUser.id,
                time: 10 * 60 * 1000, // 10 minutos
            });

            // Adicionar ao gerenciador global
            collectors[interaction.id] = collector;

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.customId === `accept-${interaction.id}`) {
                    const acceptEmbed = new EmbedBuilder()
                        .setTitle('💋 Vai dar namoro 💋')
                        .setDescription(`${targetUser} retribuiu o beijo ${user}!\nヽ(￣ω￣(￣ω￣〃)ゝ`)
                        .setImage(randomImageUrl2)
                        .setColor('701198')
                        .setTimestamp()
                        .setFooter({
                            text: 'Haruka Harano 運',
                            iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                        });

                    await buttonInteraction.reply({ embeds: [acceptEmbed], content: `${targetUser}` });

                    // Encerrar coletor
                    collector.stop();

                    // Desativar botão
                    aceita.setDisabled(true);
                    await interaction.editReply({ components: [row] });

                    // Adicionar cooldown ao usuário
                    const cooldownTime = 15 * 1000; // 15 segundos
                    cooldowns.set(user.id, Date.now() + cooldownTime);
                }
            });

            collector.on('end', async () => {
                // Remover coletor e desativar botão
                delete collectors[interaction.id];
                aceita.setDisabled(true);
                await interaction.editReply({ components: [row] }).catch(() => {});
            });
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: '❌ Ocorreu um erro ao processar o comando.',
                ephemeral: true,
            });
        }
    },
};
