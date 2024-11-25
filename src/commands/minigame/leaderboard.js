const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, 'datagame.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Mostra o ranking de jogadores com mais moedas'),
    async execute(interaction) {
        // Carregar os dados do arquivo JSON
        let data;
        try {
            data = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
        } catch (error) {
            console.error('Erro ao carregar o arquivo JSON:', error);
            return interaction.reply('Erro ao carregar os dados do ranking. Tente novamente mais tarde.');
        }

        // Gerar o leaderboard
        const leaderboard = Object.entries(data) // Acessa diretamente os dados sem a chave 'users'
            .map(([userId, userData]) => ({
                id: userId,
                coins: userData.coins || 0,
            }))
            .sort((a, b) => b.coins - a.coins)
            .slice(0, 10); // Limita a 10 jogadores

        // Verificar se há jogadores no ranking
        if (leaderboard.length === 0) {
            return interaction.reply('Ainda não há jogadores no ranking!');
        }

        // Criar embed personalizada para o leaderboard
        const embed = new EmbedBuilder()
            .setColor('#FFD700') // Cor dourada para o tema de ranking
            .setTitle('Leaderboard - Top 10 Jogadores com Mais Moedas')
            .setDescription('Aqui estão os 10 jogadores mais ricos no servidor!')
            .setThumbnail('https://example.com/ranking_thumbnail.png') // Pode ser substituído por uma imagem de sua escolha
            .setTimestamp();

        // Adicionar cada jogador ao leaderboard na embed
        leaderboard.forEach((user, index) => {
            embed.addFields({
                name: `${index + 1}. <@${user.id}>`,
                value: `${user.coins} moedas`,
                inline: true,
            });
        });

        // Enviar a resposta com a embed
        await interaction.reply({ embeds: [embed] });
    },
};
