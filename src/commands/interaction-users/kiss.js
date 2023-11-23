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
            .setRequired(true)),
    async execute(interaction) {
        if (cooldowns.has(interaction.user.id)) {
            const expirationTime = cooldowns.get(interaction.user.id);
            if (Date.now() < expirationTime) {
                // User is still on cooldown
                const remainingTime = (expirationTime - Date.now()) / 1000;
                return interaction.reply({
                    content: `❌ Você está em cooldown. Por favor, espere mais ${remainingTime.toFixed(1)} segundos.`,
                    ephemeral: true,
                });
            } else {
                cooldowns.delete(interaction.user.id);
            }
        }

        const { user } = interaction;
        const targetUser = interaction.options.getUser('alvo');

        const aceita = new ButtonBuilder()
            .setCustomId('aceita')
            .setLabel('Retribuir')
            .setStyle(ButtonStyle.Success);

        const randomImageUrl = kissImages[Math.floor(Math.random() * kissImages.length)];
        const randomImageUrl2 = kissImages2[Math.floor(Math.random() * kissImages2.length)];

        const embed = new EmbedBuilder()
            .setTitle('💋 Big Beijo 💋')
            .setDescription(`${user} lançou um beijou em ${targetUser}\nヽ(*￣▽￣*)ノミ|Ю`)
            .setColor('701198')
            .setImage(randomImageUrl)
            .setTimestamp()
            .setFooter({ text: 'Haruka Harano 運', iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png' });

        const row = new ActionRowBuilder()
            .addComponents(aceita);

        const collectorKey = `${interaction.guild.id}-${interaction.channel.id}-${interaction.user.id}`;
        if (!collectors[collectorKey]) {
            const filter = (i) => (i.customId === 'aceita') && i.user.id === targetUser.id;
            collectors[collectorKey] = interaction.channel.createMessageComponentCollector({ filter, time: 30 * 60 * 1000 });

            collectors[collectorKey].on('end', () => {
                // Remover o coletor quando ele terminar
                delete collectors[collectorKey];
                // Remover a mensagem se o alvo não interagir em 10 minutos
                if (!interaction.deferred && !interaction.replied) {
                    interaction.deleteReply();
                }
            });
        }

        const disableButtons = () => {
            aceita.setDisabled(true);
            row.components = [aceita.setDisabled(true)];
            interaction.editReply({ embeds: [embed], components: [row] });

            // Remover a capacidade de coletar interações
            collectors[collectorKey]?.stop();
        };

        await interaction.reply({ embeds: [embed], components: [row], content: `${targetUser}` });

        collectors[collectorKey].on('collect', async (buttonInteraction) => {
            const originalMessage = await interaction.fetchReply().catch(() => null);
            if (!originalMessage) {
                return;
            }
            if (buttonInteraction.customId === 'aceita') {
                const aceitarEmbed = new EmbedBuilder()
                    .setTitle('💋 Vai dar namoro 💋')
                    .setDescription(`${targetUser} retribuiu o beijo ${user}!\nヽ(￣ω￣(￣ω￣〃)ゝ`)
                    .setImage(randomImageUrl2)
                    .setColor('701198')
                    .setTimestamp()
                    .setFooter({
                        text: 'Haruka Harano 運',
                        iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                    });

                // Responder editando a mensagem original
                await buttonInteraction.reply({ embeds: [aceitarEmbed], content: `${targetUser}` });
                disableButtons();
            }

            const cooldownTime = 15 * 1000; // 15 seconds cooldown
            cooldowns.set(interaction.user.id, Date.now() + cooldownTime);
        });
    },
};
