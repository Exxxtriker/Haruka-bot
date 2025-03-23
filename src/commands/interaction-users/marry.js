/* eslint-disable max-len */
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');

const cooldowns = new Map();
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marry')
        .setDescription('*Marque a pessoa que você quer casar*')
        .addUserOption((option) => option.setName('alvo')
            .setDescription('Marque a pessoa que você deseja')
            .setRequired(true))
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        try {
            const { user } = interaction;
            const targetUser = interaction.options.getUser('alvo');

            // Gerenciar cooldowns
            if (cooldowns.has(interaction.user.id)) {
                const expirationTime = cooldowns.get(interaction.user.id);
                if (Date.now() < expirationTime) {
                    const remainingTime = ((expirationTime - Date.now()) / 1000).toFixed(1);
                    return interaction.reply({
                        content: `❌ Você está em cooldown. Espere ${remainingTime} segundos.`,
                        flags: 64,
                    });
                }
                cooldowns.delete(interaction.user.id);
            }

            const aceita = new ButtonBuilder()
                .setCustomId(`aceita-${interaction.id}`)
                .setLabel('Aceitar')
                .setStyle(ButtonStyle.Success);

            const recusa = new ButtonBuilder()
                .setCustomId(`recusa-${interaction.id}`)
                .setLabel('Recusar')
                .setStyle(ButtonStyle.Danger);

            const randomImageUrl = awaitImages[Math.floor(Math.random() * awaitImages.length)];
            const randomImageUrl2 = marryImages2[Math.floor(Math.random() * marryImages2.length)];
            const randomImageUrl3 = refuseImages[Math.floor(Math.random() * refuseImages.length)];

            const embed = new EmbedBuilder()
                .setTitle('👀 Promessa de romance 👀')
                .setDescription(`${user} quer se casar com ${targetUser}\nVai aceitar ou recusar? 👀`)
                .setColor('701198')
                .setImage(randomImageUrl)
                .setTimestamp()
                .setFooter({
                    text: 'Haruka Harano 運',
                    iconURL: 'https://media.discordapp.net/attachments/1310325661839392889/1312064166277808138/0ef715af51d62dadfa1feaaa625b025c.png?ex=675b9d3a&is=675a4bba&hm=5b253e7becc2b400f4a260e923a662beb1da7cb34df7c4c952e7468a14ad2744&=&format=webp&quality=lossless&width=427&height=427',
                });

            const row = new ActionRowBuilder().addComponents(aceita, recusa);

            // Enviar a mensagem inicial
            await interaction.reply({ embeds: [embed], components: [row], content: `${targetUser}` });

            // Criar um coletor exclusivo para esta interação
            const filter = (i) => i.customId.startsWith(`aceita-${interaction.id}`) || i.customId.startsWith(`recusa-${interaction.id}`);
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15 * 60 * 1000 });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== targetUser.id) {
                    return buttonInteraction.reply({ content: 'Apenas o alvo pode interagir com este botão!', flags: 64 });
                }

                if (buttonInteraction.customId === `aceita-${interaction.id}`) {
                    const aceitarEmbed = new EmbedBuilder()
                        .setTitle('🤗 ACEITOUUUUU 🤗')
                        .setDescription(`${targetUser} aceitou se casar com ${user}!\nヽ(￣ω￣(￣ω￣〃)ゝ`)
                        .setImage(randomImageUrl2)
                        .setColor('701198')
                        .setTimestamp();

                    await buttonInteraction.update({ embeds: [aceitarEmbed], components: [] });
                } else if (buttonInteraction.customId === `recusa-${interaction.id}`) {
                    const recusarEmbed = new EmbedBuilder()
                        .setTitle('😢 Recusou 😢')
                        .setDescription(`${user} foi rejeitado por ${targetUser}. Que triste! (╥_╥)`)
                        .setColor('FF0000')
                        .setImage(randomImageUrl3)
                        .setTimestamp();

                    await buttonInteraction.update({ embeds: [recusarEmbed], components: [] });
                }

                collector.stop();
            });

            collector.on('end', () => {
                if (!interaction.replied) {
                    interaction.deleteReply().catch(() => {});
                }
            });

            // Adicionar cooldown
            const cooldownTime = 15 * 1000; // 15 segundos
            cooldowns.set(interaction.user.id, Date.now() + cooldownTime);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Ocorreu um erro ao executar o comando.', flags: 64 });
        }
    },
};
