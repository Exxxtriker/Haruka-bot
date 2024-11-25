const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../../utils/datagame.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Mostra o ranking de jogadores com mais moedas'),
    async execute(interaction) {
        // Ler o arquivo JSON
        let data;
        try {
            data = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
        } catch (error) {
            console.error('Erro ao ler o arquivo JSON:', error);
            return interaction.reply('Erro ao carregar os dados do ranking!');
        }

        // Converter os dados em uma lista para ordenar
        const leaderboard = Object.entries(data)
            .map(([userId, userData]) => ({
                id: userId,
                coins: userData.coins || 0,
            }))
            .sort((a, b) => b.coins - a.coins) // Ordena por moedas em ordem decrescente
            .slice(0, 10); // Limita o ranking a 10 jogadores

        // Verifica se há jogadores no ranking
        if (leaderboard.length === 0) {
            return interaction.reply('Ainda não há jogadores no ranking!');
        }

        // Busca os usernames para exibir no ranking
        const leaderboardWithNames = await Promise.all(
            leaderboard.map(async (user) => {
                try {
                    const fetchedUser = await interaction.client.users.fetch(user.id);
                    return {
                        username: fetchedUser.username,
                        coins: user.coins,
                    };
                } catch {
                    return {
                        username: 'Usuário desconhecido',
                        coins: user.coins,
                    };
                }
            }),
        );

        // Criar a embed do ranking
        const embed = new EmbedBuilder()
            .setColor('#FFD700') // Cor dourada para ranking
            .setTitle('🏆 Leaderboard - Top 10 Jogadores com Mais Moedas')
            .setDescription('Aqui estão os 10 jogadores mais ricos no servidor!')
            .setTimestamp();

        // Adicionar os jogadores ao ranking
        leaderboardWithNames.forEach((user, index) => {
            embed.addFields({
                name: `${index + 1}. ${user.username}`,
                value: `${user.coins} moedas`,
                inline: false,
            });
        });

        // Envia o ranking
        await interaction.reply({ embeds: [embed] });
    },
};
