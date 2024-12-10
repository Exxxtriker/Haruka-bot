const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Apaga mensagens recentes de um canal ou de um usuário específico.')
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('Quantas mensagens deseja apagar (máx. 100).')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('usuário')
                .setDescription('Apaga mensagens de um usuário específico.')
        ),
    async execute(interaction) {
        const quantidade = interaction.options.getInteger('quantidade');
        const user = interaction.options.getUser('usuário');
        const channel = interaction.channel;

        if (quantidade > 100 || quantidade < 1) {
            return interaction.reply({
                content: 'Você deve fornecer um número entre 1 e 100.',
                ephemeral: true,
            });
        }

        // Verificar permissões
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                content: 'Você não tem permissão para apagar mensagens!',
                ephemeral: true,
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const messages = await channel.messages.fetch({ limit: quantidade });

            // Filtra mensagens de um usuário específico, se necessário
            const messagesToDelete = user
                ? messages.filter(msg => msg.author.id === user.id)
                : messages;

            await channel.bulkDelete(messagesToDelete, true); // `true` ignora mensagens antigas
            interaction.editReply({
                content: user
                    ? `Apagadas **${messagesToDelete.size} mensagens** de **${user.tag}** no canal ${channel}.`
                    : `Apagadas **${messagesToDelete.size} mensagens** no canal ${channel}.`,
            });
        } catch (error) {
            console.error(error);
            interaction.editReply({
                content: 'Ocorreu um erro ao tentar apagar as mensagens. Certifique-se de que tenho permissões para isso.',
            });
        }
    },
};
