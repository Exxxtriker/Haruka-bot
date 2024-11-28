/* eslint-disable max-len */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../../utils/datagame.json');
const shopItemsPath = path.join(__dirname, '../../utils/shopItems.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Compre itens na loja')
        .addSubcommand((subcommand) => subcommand
            .setName('comprar')
            .setDescription('Compre um item da loja')
            .addStringOption((option) => option
                .setName('item')
                .setDescription('O item que deseja comprar')
                .setRequired(true))
            .addIntegerOption((option) => option
                .setName('quantidade')
                .setDescription('Quantidade que deseja comprar')
                .setRequired(true)))
        .addSubcommand((subcommand) => subcommand
            .setName('lista')
            .setDescription('Mostra a lista de itens disponíveis para compra')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // Carregar os itens da loja
        let shopItems;
        try {
            shopItems = JSON.parse(fs.readFileSync(shopItemsPath, 'utf8'));
        } catch (error) {
            console.error('Erro ao ler o arquivo de itens da loja:', error);
            return interaction.reply('Erro ao carregar os itens da loja. Tente novamente mais tarde.');
        }

        if (subcommand === 'comprar') {
            const userId = interaction.user.id;
            const item = interaction.options.getString('item');
            const quantity = interaction.options.getInteger('quantidade');

            // Verificar se o item é válido
            if (!shopItems[item]) {
                return interaction.reply(`Item inválido! Os itens disponíveis são: ${Object.keys(shopItems).join(', ')}.`);
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
            const cost = shopItems[item] * quantity;

            // Verificar se o usuário tem moedas suficientes
            if (user.coins < cost) {
                return interaction.reply('Você não tem moedas suficientes para comprar esse item!');
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
                    { name: 'Saldo de Moedas', value: `**${user.coins}** moedas`, inline: true },
                    { name: 'Novo item no inventário', value: `**${item}**: ${user.inventory[item]}`, inline: true },
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Haruka-Shop', iconURL: 'https://images-ext-1.discordapp.net/external/clGiAls8V8fs509nd0OwBkqfI-r72ID0eQFXDnBIlLk/%3Fcb%3D20200304213920/https/static.wikia.nocookie.net/minecraft_gamepedia/images/0/0f/Netherite_Sword_JE2_BE2.png/revision/latest?format=webp&width=143&height=143' }); // Logo da loja (exemplo .setTimestamp();

            // Responder com a embed
            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'lista') {
            // Criar a embed para a lista de itens
            const embed = new EmbedBuilder()
                .setColor('#0000ff') // Cor azul para a lista
                .setTitle('Itens Disponíveis para Compra')
                .setDescription('Aqui estão os itens que você pode comprar:')
                .addFields(
                    ...Object.entries(shopItems).map(([item, price]) => ({ name: item, value: `${price} moedas`, inline: true })),
                )
                .setFooter({ text: 'Haruka-Shop', iconURL: 'https://images-ext-1.discordapp.net/external/clGiAls8V8fs509nd0OwBkqfI-r72ID0eQFXDnBIlLk/%3Fcb%3D20200304213920/https/static.wikia.nocookie.net/minecraft_gamepedia/images/0/0f/Netherite_Sword_JE2_BE2.png/revision/latest?format=webp&width=143&height=143' }) // Logo da loja (exemplo)
                .setTimestamp();

            // Responder com a embed da lista
            await interaction.reply({ embeds: [embed] });
        }
    },
};
