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
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('punch')
        .setDescription('*Marque a pessoa que você vai agredir*')
        .addUserOption((option) => option.setName('alvo')
            .setDescription('Marque a pessoa que você deseja')
            .setRequired(true)),
    async execute(interaction) {
        const { id } = await interaction.options.getUser('alvo');
        const user = interaction.user;

        const retribuir = new ButtonBuilder()
            .setCustomId('retribuir')
            .setLabel('Retribuir')
            .setStyle(ButtonStyle.Danger);

        const randomImageUrl = slapImages1[Math.floor(Math.random() * slapImages1.length)];
        const randomImageUrl2 = slapImages2[Math.floor(Math.random() * slapImages2.length)];

        const embed = new EmbedBuilder()
            .setTitle('💥Ta na hora do pau💥')
            .setDescription(`O ${user} esta acabando com <@${id}>\nEu não deixava👀`)
            .setColor('701198')
            .setImage(randomImageUrl)
            .setTimestamp()
            .setFooter({ text: 'Haruka Harano 運', iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png' });

        const row = new ActionRowBuilder()
            .addComponents(retribuir);

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = (i) => i.customId === 'retribuir' && i.user.id === id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (buttonInteraction) => {
            // Lógica para retribuir o soco
            const retribuirEmbed = new EmbedBuilder()
                .setTitle('💥Round Two💥')
                .setDescription(`<@${buttonInteraction.user.id}> retribuiu a agressão...\nIsso vai deixar marcas ${user}`)
                .setImage(randomImageUrl2)
                .setColor('701198')
                .setTimestamp()
                .setFooter({
                    text: 'Haruka Harano 運',
                    iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
                });
            await interaction.editReply({ embeds: [embed], components: [] });
            await buttonInteraction.reply({ embeds: [retribuirEmbed] });
        });
    },
};
