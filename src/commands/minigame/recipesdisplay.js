const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('receitas')
        .setDescription('Mostrar receitas da forja')
        .setDMPermission(false), // Desabilita o comando na DM

    async execute(interaction) {
        // Receitas da forja
        const recipes = {
            'Espada de pedra': { ingredientes: { Madeira: 2, Pedra: 3 }, resultado: 'Espada de pedra' },
            'Espada de ferro': { ingredientes: { 'Espada de pedra': 1, Madeira: 2, Ferro: 3 }, resultado: 'Espada de ferro' },
            'Espada de diamante': { ingredientes: { 'Espada de ferro': 1, Madeira: 2, Diamante: 3 }, resultado: 'Espada de diamante' },
            'Vara de pesca': { ingredientes: { Graveto: 3, Linha: 1, Anzol: 1 }, resultado: 'Vara de pesca' },
            Anzol: { ingredientes: { Ferro: 1 }, resultado: 'Anzol' },
            Graveto: { ingredientes: { Tabua: 2 }, resultado: 'Graveto' },
            Tabua: { ingredientes: { Madeira: 1 }, resultado: 'Tabua' },
            Picareta: { ingredientes: { Madeira: 3, Diamante: 5 }, resultado: 'Picareta' },
        };

        const embed = new EmbedBuilder()
            .setColor('#4CAF50') // Verde
            .setTitle('Receitas da Forja')
            .setDescription('Aqui estão as receitas disponíveis na forja:')
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({ text: 'Use /forja para craftar um item!' })
            .setTimestamp();

        for (const [item, details] of Object.entries(recipes)) {
            const ingredientsList = Object.entries(details.ingredientes)
                .map(([ingredient, quantity]) => `${ingredient}: ${quantity}`)
                .join(', ');

            embed.addFields(
                { name: item, value: `**Ingredientes:** ${ingredientsList}\n**Resultado:** ${details.resultado}\n`, inline: false },
            );
        }

        await interaction.reply({ embeds: [embed] });
    },
};
