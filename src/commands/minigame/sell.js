const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../../utils/datagame.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vender')
        .setDescription('Venda minérios para ganhar moedas')
        .addStringOption((option) => option
            .setName('minério')
            .setDescription('O minério que deseja vender')
            .setRequired(true))
        .addIntegerOption((option) => option
            .setName('quantidade')
            .setDescription('Quantidade que deseja vender')
            .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const mineral = interaction.options.getString('minério');
        const quantidade = interaction.options.getInteger('quantidade');

        // Valores de venda fixos para minérios e minérios refinados
        const prices = {
            Pedra: 2,
            Ferro: 5,
            Ouro: 10,
            Diamante: 20,
            'Pedra refinada': 4,
            'Ferro refinado': 10,
            'Ouro refinado': 20,
            'Diamante refinado': 40,
        };

        // Verificar se o minério pode ser vendido
        if (!prices[mineral]) {
            return interaction.reply('Esse minério não pode ser vendido!');
        }

        // Carregar os dados do arquivo JSON
        let data;
        try {
            data = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
        } catch (error) {
            console.error('Erro ao carregar o arquivo JSON:', error);
            return interaction.reply('Erro ao carregar os dados do jogador. Tente novamente mais tarde.');
        }

        // Obter os dados do usuário ou criar padrão
        const user = data[userId] || { coins: 0, inventory: {} };

        // Verificar se o jogador possui a quantidade necessária
        if ((user.inventory[mineral] || 0) < quantidade) {
            return interaction.reply(`Você não tem ${quantidade}x ${mineral} no inventário!`);
        }

        // Calcular o lucro da venda
        const lucro = prices[mineral] * quantidade;

        // Atualizar inventário e moedas
        user.inventory[mineral] -= quantidade;
        user.coins = (user.coins || 0) + lucro;
        data[userId] = user;

        // Salvar os dados atualizados
        try {
            fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Erro ao salvar o arquivo JSON:', error);
            return interaction.reply('Erro ao salvar os dados do jogador. Tente novamente mais tarde.');
        }

        // Criar embed personalizada para a resposta
        const embed = new EmbedBuilder()
            .setColor('#FFD700') // Cor dourada para representar a venda de minérios
            .setTitle('Venda de Minérios Concluída!')
            .setDescription(`Você vendeu **${quantidade}x ${mineral}** por **${lucro} moedas**!`)
            .addFields(
                { name: 'Novo Saldo de Moedas', value: `**${user.coins}** moedas`, inline: true },
                { name: 'Estoque de Inventário', value: `**${mineral}**: ${user.inventory[mineral] || 0}`, inline: true },
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
