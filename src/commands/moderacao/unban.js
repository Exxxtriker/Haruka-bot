const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('*Retirar a penalidade (banido) de um usuario 🛸.*')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption((option) => option.setName('userid')
            .setDescription('Insira o id do usuario que quer tirar.')
            .setRequired(true)),
    async execute(interaction) {
        const userId = await interaction.options.getString('userid');

        await interaction.guild.bans.fetch().then(async (bans) => {
            if (!bans.has(userId)) {
                // embeds
                return interaction.reply('errado');
            }

            const embed = new EmbedBuilder()
                .setDescription(`✅ Desbanimento Efetuado ao usuário **<@${userId}>**.`)
                .setColor(0x5fb041)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await interaction.guild.members.unban(userId);
        });
    },
};
