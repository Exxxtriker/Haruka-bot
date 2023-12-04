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
const hugImages2 = [

    'https://media.tenor.com/J7eGDvGeP9IAAAAC/enage-kiss-anime-hug.gif',
    'https://media.tenor.com/FgLRE4gi5VoAAAAC/hugs-cute.gif',
    'https://media.tenor.com/pqXmHpbIy0MAAAAd/anime-anime-hug.gif',
    'https://media.tenor.com/RR4YJdzCJRMAAAAd/chainsaw-man-hug.gif',
    'https://media.tenor.com/My2v_lTI3LIAAAAC/hug-anime.gif',
    'https://media.tenor.com/2VVGNLi-EV4AAAAC/anime-cute.gif',
    'https://media.tenor.com/ann8bhGuneoAAAAC/hug-hugging.gif',
    // Adicione mais URLs conforme necessário
];
const collectors = {};
const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('*Marque a pessoa que você quer abraçar*')
        .addUserOption((option) => option.setName('alvo')
            .setDescription('Marque a pessoa que você deseja')
            .setRequired(true)),
    async execute(interaction) {
        try {
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

            const randomImageUrl = hugImages[Math.floor(Math.random() * hugImages.length)];
            const randomImageUrl2 = hugImages2[Math.floor(Math.random() * hugImages2.length)];

            const embed = new EmbedBuilder()
                .setTitle('🫂Momento Afeto🫂')
                .setDescription(`${user} lançou um baita abraço em ${targetUser}\n（づ￣3￣）づ`)
                .setColor('701198')
                .setImage(randomImageUrl)
                .setTimestamp()
                .setFooter({
                    text: 'Haruka Harano 運',
                    iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                });

            const row = new ActionRowBuilder()
                .addComponents(aceita);

            const collectorKey = `${interaction.guild.id}-${interaction.channel.id}-${interaction.user.id}`;
            if (!collectors[collectorKey]) {
                const filter = (i) => (i.customId === 'aceita') && i.user.id === targetUser.id;
                collectors[collectorKey] = interaction.channel.createMessageComponentCollector({ filter, time: 15 * 60 * 1000 });

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
                        .setTitle('🫂Momento intimo🫂')
                        .setDescription(`${targetUser} retribuiu o abraço com outro abraço em ${user}!\nヽ(￣ω￣(￣ω￣〃)ゝ`)
                        .setImage(randomImageUrl2)
                        .setColor('701198')
                        .setTimestamp()
                        .setFooter({
                            text: 'Haruka Harano 運',
                            iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                        });

                    // Responder editando a mensagem original
                    await buttonInteraction.reply({ embeds: [aceitarEmbed], content: `${user}` });
                    disableButtons();
                }

                const cooldownTime = 15 * 1000; // 15 seconds cooldown
                cooldowns.set(interaction.user.id, Date.now() + cooldownTime);
            });
        } catch (error) {
            console.error(error);
        }
    },
};
