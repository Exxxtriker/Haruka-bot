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
            .setDescription('Razão pela punição.'))
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        const memberToKick = interaction.options.getMember('membro');
        if (!memberToKick) {
            return interaction.reply({ content: 'Usuário não encontrado no servidor.', flags: 64 });
        }

        const razao = await interaction.options.getString('razao') || 'Não há razão do punimento.';

        if (verifiPermission(interaction, memberToKick)) {
            const errEmbed = new EmbedBuilder()
                .setDescription(`❌Para você expulsar <@${memberToKick.id}> você precisa ter um cargo da moderação.`)
                .setColor(0xc72c3b);

            return interaction.reply({ embeds: [errEmbed] });
        }

        const embed = new EmbedBuilder()
            .setDescription(`✅ <@${memberToKick.id}> foi expulso do servidor pelo motivo: **${razao}**`)
            .setColor(0x5fb041)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        await memberToKick.kick({ reason: razao });
    },
};
