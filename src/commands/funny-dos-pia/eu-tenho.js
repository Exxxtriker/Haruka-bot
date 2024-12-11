const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duvida')
        .setDescription('*Marque a pessoa que você quer tirar uma duvida...*')
        .addUserOption((option) => option.setName('membro')
            .setDescription('Marque a pessoa que você deseja')
            .setRequired(true))
        .addStringOption((option) => option.setName('duvida')
            .setDescription('Sua duvida:'))
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        const { id } = await interaction.options.getUser('membro');
        const duvida = interaction.options.getString('duvida') || 'tenho duvida não to de zoação kkkj';

        const embed = new EmbedBuilder()
            .setTitle('⚠️ Atenção ⚠️')
            .setDescription(`<@${id}> eu tenho uma duvida:\n Duvida: ${duvida}`)
            .setColor('000000')
            .setImage('https://media.tenor.com/DuThn51FjPcAAAAC/nerd-emoji-nerd.gif')
            .setTimestamp()
            .setFooter({ text: 'Haruka Harano 運', iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png' });

        await interaction.reply({ embeds: [embed] });
    },
};
