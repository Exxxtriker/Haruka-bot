const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');

const awaitImages = [
    'https://media.tenor.com/QcvGepJbzYIAAAAC/anime-tumblr.gif',
    'https://media.tenor.com/0SQ3v0yMUt4AAAAC/love-young.gif',
    'https://media.tenor.com/hjzFkkWtij4AAAAC/neko.gif',
    'https://media.tenor.com/Rm39mjTHsDYAAAAC/yagami-kou-wind.gif',
    'https://media.tenor.com/dKxCiL6iEl4AAAAC/anime-couple-hug.gif',
    'https://media.tenor.com/1PxGm4x4aPAAAAAd/cat-cuddle.gif',
];

const marryImages2 = [
    'https://media.tenor.com/J7eGDvGeP9IAAAAC/enage-kiss-anime-hug.gif',
    'https://media.tenor.com/gj75w2kkqngAAAAC/tonikaku-kawaii-tonikaku.gif',
    'https://media.tenor.com/aflCuh8Hk_EAAAAd/kurumi-wedding-dress.gif',
    'https://media.tenor.com/an0diNvfSSwAAAAC/marriage-anime-sailor-moon.gif',
    'https://media.tenor.com/K8kYHxPPPakAAAAC/sailor-moon-tuxedo.gif',
    'https://media.tenor.com/183e9tG6ZmwAAAAC/just-married-nibbles.gif',
    'https://media.tenor.com/BxgPihJ1mvYAAAAC/married-just-married.gif',
    'https://media.tenor.com/xd_Lro7108IAAAAC/i-love-you-very-much-wedding.gif',
    'https://media.tenor.com/behZXJ2hOB0AAAAC/cute-love.gif',
    'https://pa1.aminoapps.com/6754/52f0ab3d7e84fcaa351fac14382085fab58538e3_hq.gif',
];

const refuseImages = [
    'https://media.tenor.com/Mr9ZiphI4JgAAAAC/vegeta-db.gif',
    'https://media.tenor.com/EHx39BTjLLQAAAAC/sad-sad-guts.gif',
    'https://media.tenor.com/6EQ2aeffrU0AAAAM/anime-sad.gif',
    'https://media.tenor.com/Mzc9A_tkLm4AAAAd/alone-sad.gif',
    'https://media.tenor.com/-P-xeHYEY9QAAAAd/sad-pablo-lonely.gif',
    'https://media.tenor.com/A0g9Rrx4aNsAAAAC/sad-angry.gif',
    'https://media.tenor.com/M_HYbyotRHwAAAAd/sad.gif',
    'https://media.tenor.com/zAlabxg7g3UAAAAd/anime-sad.gif',
    'https://media.tenor.com/i3uWiBCMgh8AAAAC/sad-aesthetic.gif',
    'https://media.tenor.com/kxDHNA1JWs8AAAAC/stillesque.gif',
];

// Coletores armazenados por chave única
const collectors = {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marry')
        .setDescription('*Marque a pessoa que você quer casar*')
        .addUserOption((option) => option.setName('alvo')
            .setDescription('Marque a pessoa que você deseja')
            .setRequired(true)),
    async execute(interaction) {
        const { user } = interaction;
        const targetUser = interaction.options.getUser('alvo');

        const aceita = new ButtonBuilder()
            .setCustomId('aceita')
            .setLabel('Aceitar')
            .setStyle(ButtonStyle.Success);

        const recusa = new ButtonBuilder()
            .setCustomId('recusa')
            .setLabel('Recusar')
            .setStyle(ButtonStyle.Danger);

        const randomImageUrl = awaitImages[Math.floor(Math.random() * awaitImages.length)];
        const randomImageUrl2 = marryImages2[Math.floor(Math.random() * marryImages2.length)];
        const randomImageUrl3 = refuseImages[Math.floor(Math.random() * refuseImages.length)];

        const embed = new EmbedBuilder()
            .setTitle('👀 Promessa de romance 👀')
            .setDescription(`${user} quer se casar com ${targetUser}\nVai aceitar ou recusar👀 \nヽ(*￣▽￣*)ノミ|Ю`)
            .setColor('701198')
            .setImage(randomImageUrl)
            .setTimestamp()
            .setFooter({ text: 'Haruka Harano 運', iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png' });

        const row = new ActionRowBuilder()
            .addComponents(aceita, recusa);

        // Verificar se o coletor já existe
        const collectorKey = `${interaction.guild.id}-${interaction.channel.id}-${interaction.user.id}`;
        if (!collectors[collectorKey]) {
            const filter = (i) => (i.customId === 'aceita' || i.customId === 'recusa') && i.user.id === targetUser.id;
            collectors[collectorKey] = interaction.channel.createMessageComponentCollector({ filter, time: 15 * 60 * 1000 });

            collectors[collectorKey].on('end', () => {
                // Remover o coletor quando ele terminar
                delete collectors[collectorKey];
                // Remover a mensagem se o alvo não interagir em 15 minutos
                if (!interaction.deferred && !interaction.replied) {
                    interaction.deleteReply();
                }
            });
        }

        const disableButtons = () => {
            aceita.setDisabled(true);
            recusa.setDisabled(true);
            row.components = [aceita.setDisabled(true), recusa.setDisabled(true)];
            interaction.editReply({ embeds: [embed], components: [row] });

            // Remover a capacidade de coletar interações
            collectors[collectorKey]?.stop();
        };

        await interaction.reply({ embeds: [embed], components: [row] });

        collectors[collectorKey].on('collect', async (buttonInteraction) => {
            const originalMessage = await interaction.fetchReply().catch(() => null);
            if (!originalMessage) {
                return;
            }
            if (buttonInteraction.customId === 'aceita') {
                const aceitarEmbed = new EmbedBuilder()
                    .setTitle('🤗 ACEITOUUUUU 🤗')
                    .setDescription(`${targetUser} Aceitou se casar com ${user}!\nヽ(￣ω￣(￣ω￣〃)ゝ`)
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
            } else if (buttonInteraction.customId === 'recusa') {
                const recusarEmbed = new EmbedBuilder()
                    .setTitle('😢 Recusou 😢')
                    .setDescription(`${user} foi rejeitado por ${targetUser}.\nQue triste!(╥_╥)`)
                    .setColor('FF0000')
                    .setImage(randomImageUrl3)
                    .setTimestamp()
                    .setFooter({
                        text: 'Haruka Harano 運',
                        iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                    });

                // Responder editando a mensagem original
                await buttonInteraction.reply({ embeds: [recusarEmbed], content: `${user}` });
                disableButtons();
            }
        });
    },
};
