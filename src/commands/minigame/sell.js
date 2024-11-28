/* eslint-disable max-len */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../../utils/datagame.json');
const shopItemsPath = path.join(__dirname, '../../utils/sellIltens.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vender')
        .setDescription('Venda itens para ganhar moedas')
        .addSubcommand((subcommand) => subcommand
            .setName('mercadoria')
            .setDescription('Venda um item do seu inventário')
            .addStringOption((option) => option
                .setName('item')
                .setDescription('O item que deseja vender')
                .setRequired(true))
            .addIntegerOption((option) => option
                .setName('quantidade')
                .setDescription('Quantidade que deseja vender')
                .setRequired(true)))
        .addSubcommand((subcommand) => subcommand
            .setName('lista')
            .setDescription('Mostra a lista de itens disponíveis para venda')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // Carregar os itens da loja para venda (os preços aqui são os mesmos que os da loja)
        let shopItems;
        try {
            shopItems = JSON.parse(fs.readFileSync(shopItemsPath, 'utf8'));
        } catch (error) {
            console.error('Erro ao ler o arquivo de itens da loja:', error);
            return interaction.reply('Erro ao carregar os itens da loja. Tente novamente mais tarde.');
        }

        if (subcommand === 'vender') {
            const userId = interaction.user.id;
            const item = interaction.options.getString('item');
            const quantity = interaction.options.getInteger('quantidade');

            // Verificar se o item é válido
            if (!shopItems[item]) {
                return interaction.reply(`Item inválido! Os itens disponíveis para venda são: ${Object.keys(shopItems).join(', ')}.`);
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

            // Verificar se o jogador tem a quantidade necessária para vender
            if ((user.inventory[item] || 0) < quantity) {
                return interaction.reply(`Você não tem ${quantity}x ${item} no inventário!`);
            }

            // Calcular o valor da venda
            const sellPrice = shopItems[item];
            const revenue = sellPrice * quantity;

            // Atualizar os dados do usuário
            user.coins += revenue;
            user.inventory[item] -= quantity;
            if (user.inventory[item] <= 0) {
                delete user.inventory[item]; // Remover item do inventário se a quantidade for 0 ou menor
            }
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
                .setColor('#ff6347') // Cor vermelha para representar a venda de itens
                .setTitle('Venda realizada com sucesso!')
                .setDescription(`Você vendeu **${quantity}x ${item}** por **${revenue} moedas**.`)
                .addFields(
                    { name: 'Novo Saldo de Moedas', value: `**${user.coins}** moedas`, inline: true },
                    { name: 'Estoque Atual', value: `**${item}**: ${user.inventory[item] || 0}`, inline: true },
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Haruka-Shop', iconURL: 'https://images-ext-1.discordapp.net/external/clGiAls8V8fs509nd0OwBkqfI-r72ID0eQFXDnBIlLk/%3Fcb%3D20200304213920/https/static.wikia.nocookie.net/minecraft_gamepedia/images/0/0f/Netherite_Sword_JE2_BE2.png/revision/latest?format=webp&width=143&height=143' }); // Logo da loja

            // Responder com a embed
            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'lista') {
            // Criar a embed para a lista de itens
            const embed = new EmbedBuilder()
                .setColor('#0000ff') // Cor azul para a lista
                .setTitle('Itens Disponíveis para Venda')
                .setDescription('Aqui estão os itens que você pode vender:')
                .addFields(
                    ...Object.entries(shopItems).map(([item, price]) => ({ name: item, value: `${price} moedas`, inline: true })),
                )
                .setFooter({ text: 'Haruka-Shop', iconURL: 'https://images-ext-1.discordapp.net/external/clGiAls8V8fs509nd0OwBkqfI-r72ID0eQFXDnBIlLk/%3Fcb%3D20200304213920/https/static.wikia.nocookie.net/minecraft_gamepedia/images/0/0f/Netherite_Sword_JE2_BE2.png/revision/latest?format=webp&width=143&height=143' }) // Logo da loja
                .setTimestamp();

            // Responder com a embed da lista
            await interaction.reply({ embeds: [embed] });
        }
    },
};
