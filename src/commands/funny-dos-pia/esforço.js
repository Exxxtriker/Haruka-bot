const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('esforço')
        .setDescription('*Marque a pessoa que não esta fazendo um esforço...*')
        .addUserOption((option) => option.setName('membro')
            .setDescription('Marque a pessoa que você deseja')
            .setRequired(true)),
    async execute(interaction) {
        const { id } = await interaction.options.getUser('membro');

        const embed = new EmbedBuilder()
            .setTitle('⚠️ Koe menóh ⚠️')
            .setDescription(`Faz um esforço <@${id}> kkkj`)
            .setColor('000000')
            .setImage('https://i.pinimg.com/originals/d6/db/80/d6db80ea53abfa5cfc407188cad53258.gif')
            .setTimestamp()
            .setFooter({ text: 'Haruka Harano 運', iconURL: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png' });

        await interaction.reply({ embeds: [embed] });
    },
};
