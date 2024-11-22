const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('*Jogue ping pong com a Haruka*'),
    async execute(interaction) {
        await interaction.deferReply();

        const reply = await interaction.fetchReply();

        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply(
            `Pong!\nClient: ${ping}ms\nWebsocket: ${interaction.client.ws.ping}ms`,
        );
    },
};
