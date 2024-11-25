const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, 'datamc', 'datagame.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Compre itens na loja')
        .addStringOption((option) => option
            .setName('item')
            .setDescription('O item que deseja comprar')
            .setRequired(true))
        .addIntegerOption((option) => option
            .setName('quantidade')
            .setDescription('Quantidade que deseja comprar')
            .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const item = interaction.options.getString('item');
        const quantity = interaction.options.getInteger('quantidade');

        const prices = { pedra: 10, madeira: 5, ferro: 25 }; // Exemplos de preços

        // Verificar se o item é válido
        if (!prices[item]) {
            return interaction.reply('Item inválido! Os itens disponíveis são: pedra, madeira e ferro.');
        }

        let data;
        try {
            // Carregar os dados do arquivo JSON
            data = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
        } catch (error) {
            console.error('Erro ao ler o arquivo de dados:', error);
            return interaction.reply('Erro ao carregar os dados do usuário. Tente novamente mais tarde.');
        }

        // Obter dados do usuário ou criar padrão
        const user = data[userId] || { coins: 100, inventory: {} };
        const cost = prices[item] * quantity;

        // Verificar se o usuário tem moedas suficientes
        if (user.coins < cost) {
            return interaction.reply('Você não tem moedas suficientes!');
        }

        // Atualizar os dados do usuário
        user.coins -= cost;
        user.inventory[item] = (user.inventory[item] || 0) + quantity;
        data[userId] = user;

        try {
            // Salvar os dados atualizados no arquivo
            fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Erro ao salvar os dados no arquivo:', error);
            return interaction.reply('Erro ao salvar os dados. Tente novamente mais tarde.');
        }

        // Criar a embed personalizada para a resposta
        const embed = new EmbedBuilder()
            .setColor('#00ff00') // Cor verde para sucesso
            .setTitle('Compra realizada com sucesso!')
            .setDescription(`Você comprou **${quantity}x ${item}** por **${cost} moedas**.`)
            .addFields(
                { name: 'Saldo atual', value: `Moedas: **${user.coins}**`, inline: true },
                { name: 'Novo item no inventário', value: `**${item}**: ${user.inventory[item]}`, inline: true },
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        // Responder com a embed
        await interaction.reply({ embeds: [embed] });
    },
};
