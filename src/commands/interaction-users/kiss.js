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

    'https://media.tenor.com/6I89xfrC8iQAAAAC/anime-beijo-couple.gif',
    'https://media.tenor.com/Ogthkl9rYBMAAAAC/ichigo-hiro.gif',
    'https://media.tenor.com/2MZgbU7fxrUAAAAd/tomo-chan-is-a-girl-kiss-anime.gif',
    'https://media.tenor.com/dn_KuOESmUYAAAAC/engage-kiss-anime-kiss.gif',
    'https://media.tenor.com/yY5RfqCmfM0AAAAd/muppets-kermit.gif',
    'https://media.tenor.com/F02Ep3b2jJgAAAAC/cute-kawai.gif',
    // Adicione mais URLs conforme necessário
];
const cooldowns = new Map();
module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('*Marque a pessoa que você vai beijar*')
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
        const { id } = await interaction.options.getUser('alvo');
        const user = interaction.user;

        const retribuir = new ButtonBuilder()
            .setCustomId('retribuir')
            .setLabel('Retribuir')
            .setStyle(ButtonStyle.Success);

        const randomImageUrl = kissImages[Math.floor(Math.random() * kissImages.length)];
        const randomImageUrl2 = kissImages2[Math.floor(Math.random() * kissImages2.length)];

        const embed = new EmbedBuilder()
            .setTitle('💋 Beijokas 💋')
            .setDescription(`O ${user} beijou <@${id}>... nuossaaaa\n（づ￣3￣）づ╭❤️～`)
            .setColor('701198')
            .setImage(randomImageUrl)
            .setTimestamp()
            .setFooter({ text: 'Haruka Harano 運', iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png' });

        const row = new ActionRowBuilder()
            .addComponents(retribuir);

        await interaction.reply({ embeds: [embed], components: [row], content: `<@${id}>` });

        const filter = (i) => i.customId === 'retribuir' && i.user.id === id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15 * 60 * 1000 });

        collector.on('collect', async (buttonInteraction) => {
            // Lógica para retribuir o beijo
            const retribuirEmbed = new EmbedBuilder()
                .setTitle('💋 Beijokas 💋')
                .setDescription(`<@${buttonInteraction.user.id}> retribuiu o beijo em ${user} !\n （づ￣3￣）づ╭❤️～`)
                .setImage(randomImageUrl2)
                .setColor('701198')
                .setTimestamp()
                .setFooter({
                    text: 'Haruka Harano 運',
                    iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                });
            await buttonInteraction.update({ embeds: [retribuirEmbed], components: [], content: `${user}` });
        });
        const cooldownTime = 15 * 1000; // 15 seconds cooldown
        cooldowns.set(interaction.user.id, Date.now() + cooldownTime);
    },
};
