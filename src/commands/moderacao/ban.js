const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { verifiPermission } = require('./functions/functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('*Punir um membro com a penalidade de ban ☠️.*')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption((option) => option.setName('membro')
            .setDescription('Usuario que vai ser banido:')
            .setRequired(true))
        .addStringOption((option) => option.setName('razao')
            .setDescription('Razão pelo banimento:'))
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        const { id } = interaction.options.getUser('membro');
        const razao = interaction.options.getString('razao') || 'Não há razão do punimento.';

        const memberToBan = await interaction.guild.members.cache.get(id);
        if (!memberToBan) return interaction.reply({ content: 'usuário não encontrado, verifique se ele está no servidor', flags: 64 });

        if (verifiPermission(interaction, memberToBan)) {
            const errEmbed = new EmbedBuilder()
                .setDescription(`❌ Para você banir <@${id}> você precisa ter um cargo da moderação.`)
                .setColor(0xc72c3b);

            return interaction.reply({ embeds: [errEmbed] });
        }

        const embed = new EmbedBuilder()
            .setDescription(`✅ Banimento aplicado ao usuario <@${id}> pela razão ${razao}`)
            .setColor(0x5fb041)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        await memberToBan.ban({ razao });
    },
};
