/* eslint-disable max-len */
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
            .setColor('#F4C542') // Cor dourada vibrante
            .setTitle('🏆 **Leaderboard - Top 10 Mais Ricos** 🏆')
            .setDescription('Os jogadores mais ricos do servidor estão listados aqui!')
            .setThumbnail('https://media.discordapp.net/attachments/1310325661839392889/1312063913852145695/bag-gold-coins-with-number-3-it_81048-6884.png?ex=674b223e&is=6749d0be&hm=d11e9df3dc7963ddf56a855dd16e91492f2ecfa0ebcf3ed30e1fb9191e59db9b&=&format=webp&quality=lossless&width=427&height=427') // Ícone de troféu
            .setFooter({
                text: 'Continue jogando para alcançar o topo!',
                iconURL: 'https://media.discordapp.net/attachments/1310325661839392889/1312064166277808138/0ef715af51d62dadfa1feaaa625b025c.png?ex=674b227a&is=6749d0fa&hm=48f45efd8141ced82a0c92943f73fc7c125df1e3ee8bba03694fc5c7d4a72aa2&=&format=webp&quality=lossless&width=427&height=427', // Ícone pequeno
            })
            .setTimestamp();

        // Destaque para o Top 1 (simulando centralização)
        const top1 = leaderboardWithNames[0];
        embed.addFields({
            name: '🥇 **Top 1 - O mais rico!**',
            value: `\n👑 **${top1.username}**: 💰 **${top1.coins.toLocaleString()} moedas**\n`,
            inline: false, // Centralizado ocupando a largura total
        });

        // Adicionar os outros 9 jogadores
        if (leaderboardWithNames.length > 1) {
            const otherPlayers = leaderboardWithNames.slice(1);
            embed.addFields({
                name: '🏅 **Outros jogadores no Top 10**',
                value: otherPlayers
                    .map(
                        (user, index) => `**#${index + 2}** - ${user.username}: 💰 ${user.coins.toLocaleString()} moedas`,
                    )
                    .join('\n'),
                inline: false, // Listagem completa abaixo
            });
        }

        // Envia o ranking
        await interaction.reply({ embeds: [embed] });
    },
};
