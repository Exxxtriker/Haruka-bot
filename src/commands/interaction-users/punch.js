const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');

const slapImages1 = [
    'https://media.tenor.com/GBShVmDnx9kAAAAC/anime-slap.gif',
    'https://media.tenor.com/isZtlDzkDYwAAAAd/slap.gif',
    'https://media.tenor.com/Up9LqtY-AuIAAAAC/anime-chika-fujiwara.gif',
    'https://media.tenor.com/BoYBoopIkBcAAAAC/anime-smash.gif',
    'https://fantasticmemes.files.wordpress.com/2013/06/1353830854270.gif',
    'https://gifdb.com/images/high/anime-fight-stomach-punch-q01fsbu1bhqh7otb.gif',
    'https://media.tenor.com/Bbqio6XZpegAAAAd/mortal-kombat-punch.gif',
    'https://i.gifer.com/2xOE.gif',
    'https://media.tenor.com/olTK-ZTq0HIAAAAC/invincible-omni-man.gif',
    'https://media.tenor.com/4VI4FgOOus8AAAAC/omni-man-invincible.gif',
    'https://media.tenor.com/ex9tIvmqZ4cAAAAC/mkx-mortal-kombat.gif',
    'https://media.tenor.com/pa8s4puJhaYAAAAd/hajime-no-ippo-dempsey-roll.gif',
    'https://media.tenor.com/34rnqDiqQ7MAAAAC/boxing-box.gif',
    'https://media.tenor.com/ELikcUIIK0gAAAAd/goro-majima-kazuma-kiryu-yakuza-kiss-gay-love-gender-ryu-ga-gotoku-goro-majima.gif',
    'https://tenor.com/pt-BR/view/yakuza-salt-yakuza0-kamurocho-fight-gif-17240408',
    'https://media.tenor.com/UEF4khH2Ye0AAAAC/yakuza-kiryu.gif',
    'https://media.tenor.com/n6P8yuXsSsIAAAAd/dragon-ball-super-broly-frieza.gif',
    'https://media.tenor.com/JquHrBqvAWoAAAAd/saiyan-destroyer.gif',
    'https://media.tenor.com/SYBbHkpBq-sAAAAd/naruto-uchiha-sasuke.gif',
    'https://media.tenor.com/Bsrk9d8-BRwAAAAd/naruto-sasuke.gif',
    'https://media.tenor.com/2o2dVrH6fiUAAAAd/rock-lee-reverse-lotus.gif',
    'https://media.tenor.com/C5F7JE6xmtIAAAAC/sasuke-orochimaru.gif',
    'https://media.tenor.com/uQA1kJfi9NIAAAAd/sasuke-orochimaru.gif',
    'https://media.tenor.com/kdPdOB_RQWwAAAAd/punch-direct-hit.gif',
    'https://media.tenor.com/0ifkFdUxqe4AAAAd/gon-neferpitou.gif',
    'https://media.tenor.com/7u2dD57wmB8AAAAd/hajime-no-ippo-sendo-takeshi.gif',
    'https://media.tenor.com/UeOIfdk_XnMAAAAd/hajime-no-ippo-sendo-takeshi.gif',
    'https://media.tenor.com/NTH6jymmElcAAAAd/baki-fight.gif',
    'https://media.tenor.com/6tkj4GlWzM0AAAAd/che-guevara.gif',
    'https://media.tenor.com/7pCfC7W2T0sAAAAd/biscuit-oliva-olivia.gif',
    'https://media.tenor.com/eJ-qdn2dOtEAAAAd/hajime-no-ippo-ippo.gif',
    'https://media.tenor.com/XIgzyvU9tMoAAAAC/attack-hit.gif',
];

const slapImages2 = [
    'https://media.tenor.com/GBShVmDnx9kAAAAC/anime-slap.gif',
    'https://media.tenor.com/isZtlDzkDYwAAAAd/slap.gif',
    'https://media.tenor.com/Up9LqtY-AuIAAAAC/anime-chika-fujiwara.gif',
    'https://media.tenor.com/BoYBoopIkBcAAAAC/anime-smash.gif',
    'https://fantasticmemes.files.wordpress.com/2013/06/1353830854270.gif',
    'https://gifdb.com/images/high/anime-fight-stomach-punch-q01fsbu1bhqh7otb.gif',
    'https://media.tenor.com/Bbqio6XZpegAAAAd/mortal-kombat-punch.gif',
    'https://i.gifer.com/2xOE.gif',
    'https://media.tenor.com/olTK-ZTq0HIAAAAC/invincible-omni-man.gif',
    'https://media.tenor.com/4VI4FgOOus8AAAAC/omni-man-invincible.gif',
    'https://media.tenor.com/ex9tIvmqZ4cAAAAC/mkx-mortal-kombat.gif',
    'https://media.tenor.com/pa8s4puJhaYAAAAd/hajime-no-ippo-dempsey-roll.gif',
    'https://media.tenor.com/34rnqDiqQ7MAAAAC/boxing-box.gif',
    'https://media.tenor.com/ELikcUIIK0gAAAAd/goro-majima-kazuma-kiryu-yakuza-kiss-gay-love-gender-ryu-ga-gotoku-goro-majima.gif',
    'https://tenor.com/pt-BR/view/yakuza-salt-yakuza0-kamurocho-fight-gif-17240408',
    'https://media.tenor.com/UEF4khH2Ye0AAAAC/yakuza-kiryu.gif',
    'https://media.tenor.com/n6P8yuXsSsIAAAAd/dragon-ball-super-broly-frieza.gif',
    'https://media.tenor.com/JquHrBqvAWoAAAAd/saiyan-destroyer.gif',
    'https://media.tenor.com/SYBbHkpBq-sAAAAd/naruto-uchiha-sasuke.gif',
    'https://media.tenor.com/Bsrk9d8-BRwAAAAd/naruto-sasuke.gif',
    'https://media.tenor.com/2o2dVrH6fiUAAAAd/rock-lee-reverse-lotus.gif',
    'https://media.tenor.com/C5F7JE6xmtIAAAAC/sasuke-orochimaru.gif',
    'https://media.tenor.com/uQA1kJfi9NIAAAAd/sasuke-orochimaru.gif',
    'https://media.tenor.com/kdPdOB_RQWwAAAAd/punch-direct-hit.gif',
    'https://media.tenor.com/0ifkFdUxqe4AAAAd/gon-neferpitou.gif',
    'https://media.tenor.com/7u2dD57wmB8AAAAd/hajime-no-ippo-sendo-takeshi.gif',
    'https://media.tenor.com/UeOIfdk_XnMAAAAd/hajime-no-ippo-sendo-takeshi.gif',
    'https://media.tenor.com/NTH6jymmElcAAAAd/baki-fight.gif',
    'https://media.tenor.com/6tkj4GlWzM0AAAAd/che-guevara.gif',
    'https://media.tenor.com/7pCfC7W2T0sAAAAd/biscuit-oliva-olivia.gif',
    'https://media.tenor.com/eJ-qdn2dOtEAAAAd/hajime-no-ippo-ippo.gif',
    'https://media.tenor.com/XIgzyvU9tMoAAAAC/attack-hit.gif',
];
const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('punch')
        .setDescription('*Marque a pessoa que você quer arrebentar*')
        .addUserOption((option) => option
            .setName('alvo')
            .setDescription('Marque a pessoa que você deseja')
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
                        ephemeral: true,
                    });
                }
            }

            // Configurar o botão
            const aceita = new ButtonBuilder()
                .setCustomId(`aceita-${interaction.id}`) // ID único
                .setLabel('Retribuir')
                .setStyle(ButtonStyle.Success);

            const randomImageUrl = slapImages1[Math.floor(Math.random() * slapImages1.length)];
            const embed = new EmbedBuilder()
                .setTitle('👊🏼 Now fight 👊🏼')
                .setDescription(`${user} cassetou ${targetUser}\n Isso vai deixar marcas...\n╰（‵□′）╯`)
                .setColor('701198')
                .setImage(randomImageUrl)
                .setTimestamp()
                .setFooter({
                    text: 'Haruka Harano 運',
                    iconURL:
                        'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                });

            const row = new ActionRowBuilder().addComponents(aceita);

            // Responder ao comando
            await interaction.reply({
                embeds: [embed],
                components: [row],
                content: `${targetUser}`,
            });

            // Configurar o coletor
            const filter = (i) => i.customId === `aceita-${interaction.id}` && i.user.id === targetUser.id;
            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: 15 * 60 * 1000, // 15 minutos
            });

            collector.on('collect', async (buttonInteraction) => {
                const randomImageUrl2 = slapImages2[Math.floor(Math.random() * slapImages2.length)];
                const aceitarEmbed = new EmbedBuilder()
                    .setTitle('👊🏼Round Two, Fight !!!👊🏼')
                    .setDescription(`${targetUser} retribuiu o soco em ${user}!\n Ui eu não deixava !!\n(ノ｀Д)ノ`)
                    .setImage(randomImageUrl2)
                    .setColor('701198')
                    .setTimestamp()
                    .setFooter({
                        text: 'Haruka Harano 運',
                        iconURL:
                            'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                    });

                await buttonInteraction.reply({ embeds: [aceitarEmbed], content: `${user}` });

                // Desabilitar o botão
                aceita.setDisabled(true);
                await interaction.editReply({ components: [row] });

                collector.stop();
            });

            collector.on('end', async () => {
                // Desativar botão ao expirar o tempo
                aceita.setDisabled(true);
                await interaction.editReply({ components: [row] }).catch(() => null);
            });

            // Aplicar cooldown
            cooldowns.set(user.id, Date.now() + 15 * 1000); // 15 segundos
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: '❌ Ocorreu um erro ao executar o comando.',
                ephemeral: true,
            });
        }
    },
};
