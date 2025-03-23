/* eslint-disable no-await-in-loop */
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Apaga mensagens recentes de um canal ou de um usuário específico.')
        .addIntegerOption((option) => option.setName('quantidade')
            .setDescription('Quantas mensagens deseja apagar (máx. 100).')
            .setRequired(true))
        .addUserOption((option) => option.setName('usuário')
            .setDescription('Apaga mensagens de um usuário específico.'))
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        const quantidade = interaction.options.getInteger('quantidade');
        const user = interaction.options.getUser('usuário');
        const { channel } = interaction;

        if (quantidade > 100 || quantidade < 1) {
            return interaction.reply({
                content: 'Você deve fornecer um número entre 1 e 100.',
                flags: 64,
            });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                content: 'Você não tem permissão para apagar mensagens!',
                flags: 64,
            });
        }

        await interaction.deferReply({ flags: 64 });

        try {
            const messages = await channel.messages.fetch({ limit: quantidade });

            const messagesToDelete = user
                ? messages.filter((msg) => msg.author.id === user.id)
                : messages;

            const oldMessages = messagesToDelete.filter((msg) => msg.createdTimestamp < Date.now() - 14 * 24 * 60 * 60 * 1000);
            const recentMessages = messagesToDelete.filter((msg) => msg.createdTimestamp >= Date.now() - 14 * 24 * 60 * 60 * 1000);

            // Apagar mensagens recentes em massa
            if (recentMessages.size > 0) {
                await channel.bulkDelete(recentMessages, true);
            }

            // Apagar mensagens antigas individualmente
            for (const message of oldMessages.values()) {
                try {
                    await message.delete();
                } catch (error) {
                    if (error.code !== 10008) {
                        // Loga apenas erros diferentes de "Unknown Message"
                        console.error(`Erro ao apagar mensagem: ${error}`);
                    }
                }
            }

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
