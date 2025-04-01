/* eslint-disable max-len */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../../utils/datagame.json');
const shopItemsPath = path.join(__dirname, '../../utils/data/sellIltens.json');

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
                .setRequired(true)
                .addChoices(
                    { name: 'Pedra', value: 'Pedra' },
                    { name: 'Madeira', value: 'Madeira' },
                    { name: 'Ferro', value: 'Ferro' },
                    { name: 'Ouro', value: 'Ouro' },
                    { name: 'Diamante', value: 'Diamante' },
                    { name: 'Ferro refinado', value: 'Ferro refinado' },
                    { name: 'Ouro refinado', value: 'Ouro refinado' },
                    { name: 'Diamante refinado', value: 'Diamante refinado' },
                    { name: 'Pedra refinada', value: 'Pedra refinada' },
                    { name: 'Isca', value: 'Isca' },
                    { name: 'Linha', value: 'Linha' },
                    { name: 'Machado', value: 'Machado' },
                    { name: 'Picareta', value: 'Picareta' },
                    { name: 'Espada de pedra', value: 'Espada de pedra' },
                    { name: 'Espada de ferro', value: 'Espada de ferro' },
                    { name: 'Espada de diamante', value: 'Espada de diamante' },
                    { name: 'Vara de pesca', value: 'Vara de pesca' },
                    { name: 'Chave [NULL]', value: 'Chave [NULL]' },
                    { name: 'Poção de vida', value: 'Poção de vida' },
                ))
            .addIntegerOption((option) => option
                .setName('quantidade')
                .setDescription('Quantidade que deseja vender')
                .setRequired(true)))
        .addSubcommand((subcommand) => subcommand
            .setName('lista')
            .setDescription('Mostra a lista de itens disponíveis para venda'))
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // Responder imediatamente para evitar o timeout
        await interaction.deferReply();

        let shopItems;
        try {
            shopItems = JSON.parse(fs.readFileSync(shopItemsPath, 'utf8'));
        } catch (error) {
            console.error('Erro ao ler o arquivo de itens da loja:', error);
            return interaction.editReply('Erro ao carregar os itens da loja. Tente novamente mais tarde.');
        }

        if (subcommand === 'mercadoria') {
            const userId = interaction.user.id;
            const item = interaction.options.getString('item');
            const quantity = interaction.options.getInteger('quantidade');

            if (quantity <= 0) {
                return interaction.editReply('A quantidade deve ser maior que zero.');
            }

            if (!shopItems[item]) {
                return interaction.editReply(`Item inválido! Os itens disponíveis para venda são: ${Object.keys(shopItems).join(', ')}.`);
            }

            let data;
            try {
                data = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
            } catch (error) {
                console.error('Erro ao ler o arquivo de dados:', error);
                return interaction.editReply('Erro ao carregar os dados do usuário. Tente novamente mais tarde.');
            }

            const user = data[userId] || { coins: 100, inventory: {} };

            if ((user.inventory[item] || 0) < quantity) {
                return interaction.editReply(`Você não tem ${quantity}x ${item} no inventário!`);
            }

            const sellPrice = shopItems[item];
            const revenue = sellPrice * quantity;

            user.coins += revenue;
            user.inventory[item] -= quantity;
            if (user.inventory[item] <= 0) {
                delete user.inventory[item];
            }
            data[userId] = user;

            try {
                fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
            } catch (error) {
                console.error('Erro ao salvar os dados no arquivo:', error);
                return interaction.editReply('Erro ao salvar os dados. Tente novamente mais tarde.');
            }

            const embed = new EmbedBuilder()
                .setColor('#ff6347') // Corrigido aqui
                .setTitle('Venda realizada com sucesso!')
                .setDescription(`Você vendeu **${quantity}x ${item}** por **${revenue} moedas**.`)
                .addFields(
                    { name: 'Novo Saldo de Moedas', value: `**${user.coins}** moedas`, inline: true },
                    { name: 'Estoque Atual', value: `**${item}**: ${user.inventory[item] || 0}`, inline: true },
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Haruka-Shop', iconURL: 'https://images-ext-1.discordapp.net/external/clGiAls8V8fs509nd0OwBkqfI-r72ID0eQFXDnBIlLk/%3Fcb%3D20200304213920/https/static.wikia.nocookie.net/minecraft_gamepedia/images/0/0f/Netherite_Sword_JE2_BE2.png/revision/latest?format=webp&width=143&height=143' });

            await interaction.editReply({ embeds: [embed] });
        } else if (subcommand === 'lista') {
            const embed = new EmbedBuilder()
                .setColor('#0000ff')
                .setTitle('Itens Disponíveis para Venda')
                .setDescription('Aqui estão os itens que você pode vender:')
                .addFields(
                    ...Object.entries(shopItems).map(([item, price]) => ({ name: item, value: `${price} moedas`, inline: true })),
                )
                .setFooter({ text: 'Haruka-Shop', iconURL: 'https://images-ext-1.discordapp.net/external/clGiAls8V8fs509nd0OwBkqfI-r72ID0eQFXDnBIlLk/%3Fcb%3D20200304213920/https/static.wikia.nocookie.net/minecraft_gamepedia/images/0/0f/Netherite_Sword_JE2_BE2.png/revision/latest?format=webp&width=143&height=143' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    },
};
