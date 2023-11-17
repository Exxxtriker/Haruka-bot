const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { verifiPermission } = require('./functions/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('*Utilize para expulsar algum membro ☠️.*')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption((option) => option.setName('membro')
            .setDescription('Usuario que vai ser expulso.')
            .setRequired(true))
        .addStringOption((option) => option.setName('razao')
            .setDescription('Razão pela punição.')),
    async execute(interaction) {
        const { id } = await interaction.options.getUser('membro');
        const razao = await interaction.options.getString('razao') || 'Não há razão do punimento.';

        const memberToKick = await interaction.guild.members.cache.get(id);
        if (!memberToKick) return interaction.reply({ content: 'usuário não encontrado, verifique se ele está no servidor', ephemeral: true });

        if (verifiPermission(interaction, memberToKick)) {
            const errEmbed = new EmbedBuilder()
                .setDescription(`❌Para você expulsar <@${id}> você precisa ter um cargo da moderação.`)
                .setColor(0xc72c3b);

            return interaction.reply({ embeds: [errEmbed] });
        }

        const embed = new EmbedBuilder()
            .setDescription(`✅ <@${id}> foi expulso do servidor pelo motivo: **${razao}**`)
            .setColor(0x5fb041)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        await memberToKick.kick({ razao });
    },
};
