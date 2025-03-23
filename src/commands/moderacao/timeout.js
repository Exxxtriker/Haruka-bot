const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('castigar')
        .setDescription('*Coloque um usuário de castigo (timeout) no servidor 🔇.*')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((option) => option.setName('membro')
            .setDescription('Usuário que será castigado.')
            .setRequired(true))
        .addIntegerOption((option) => option.setName('dias')
            .setDescription('Número de dias.'))
        .addIntegerOption((option) => option.setName('horas')
            .setDescription('Número de horas.'))
        .addIntegerOption((option) => option.setName('minutos')
            .setDescription('Número de minutos.'))
        .addStringOption((option) => option.setName('razao')
            .setDescription('Razão para o castigo.'))
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        const user = interaction.options.getUser('membro');
        const days = interaction.options.getInteger('dias') || 0;
        const hours = interaction.options.getInteger('horas') || 0;
        const minutes = interaction.options.getInteger('minutos') || 0;
        const razao = interaction.options.getString('razao') || 'Não foi especificada uma razão para o castigo.';

        // Calcula a duração total em milissegundos
        const timeoutDuration = ((days * 24 * 60) + (hours * 60) + minutes) * 60 * 1000;

        if (timeoutDuration <= 0 || timeoutDuration > 28 * 24 * 60 * 60 * 1000) { // Máximo de 28 dias
            return interaction.reply({
                content: 'Por favor, insira um tempo válido. O máximo permitido é de 28 dias.',
                flags: 64,
            });
        }

        // Obtém o membro a ser castigado
        const memberToPunish = interaction.guild.members.cache.get(user.id);
        if (!memberToPunish) {
            return interaction.reply({
                content: 'Usuário não encontrado no servidor.',
                flags: 64,
            });
        }

        // Verifica permissões
        if (memberToPunish.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: 'Você não pode aplicar timeout em um administrador.',
                flags: 64,
            });
        }

        try {
            // Aplica timeout
            await memberToPunish.timeout(timeoutDuration, razao);

            const embed = new EmbedBuilder()
                // eslint-disable-next-line max-len
                .setDescription(`✅ <@${user.id}> foi colocado em tempo limite por:\n- **${days} dias**\n- **${hours} horas**\n- **${minutes} minutos**.\nMotivo: **${razao}**`)
                .setColor(0x5fb041)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: 'Ocorreu um erro ao tentar aplicar o timeout. Verifique se tenho permissões suficientes.',
                flags: 64,
            });
        }
    },
};
