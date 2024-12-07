/* eslint-disable max-len */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../../utils/datagame.json');

// Preços dos peixes
const shopItems = {
    'Peixe comum': 10, // Preço do peixe comum
    'Peixe raro': 50, // Preço do peixe raro
    Tesouro: 300, // Preço do tesouro
    'Peixe lendário': 300, // Preço do peixe lendário
    'Peixe mítico': 10000, // Preço do peixe mítico
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('capitao')
        .setDescription('Executa a ação do capitão, disponível apenas às sextas-feiras.')
        .addStringOption((option) => option.setName('mercadoria')
            .setDescription('Escolha o tipo de peixe para vender')
            .setRequired(true)
            .addChoices(
                { name: 'Peixe comum', value: 'Peixe comum' },
                { name: 'Peixe raro', value: 'Peixe raro' },
                { name: 'Tesouro', value: 'Tesouro' },
                { name: 'Peixe lendário', value: 'Peixe lendário' },
                { name: 'Peixe mítico', value: 'Peixe mítico' },
            ))
        .addIntegerOption((option) => option.setName('quantidade')
            .setDescription('Quantidade de peixes que deseja vender')
            .setRequired(true)),
    async execute(interaction) {
        // Responder imediatamente para evitar o timeout
        await interaction.deferReply();

        // Obter a data atual
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

        // Verificar se hoje é sexta-feira (5)
        if (dayOfWeek !== 5) {
            const embed = new EmbedBuilder()
                .setColor('#e74c3c') // Cor vermelha para o erro
                .setTitle('Atenção!')
                .setDescription('O capitão só volta para o porto às sextas-feiras!')
                .addFields({ name: 'Próxima Oportunidade', value: 'Tente novamente na próxima sexta-feira!' })
                .setFooter({ text: 'Capetão', iconURL: 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/1/1e/Oak_Boat_JE2_BE1.png/revision/latest?cb=20191220213315' })
                .setThumbnail('https://ruined.dev/_next/image?url=https%3A%2F%2Fddragon.leagueoflegends.com%2Fcdn%2Fimg%2Fchampion%2Ftiles%2FGangplank_0.jpg&w=640&q=75')
                .setTimestamp();

            return await interaction.editReply({ embeds: [embed] });
        }

        // Lógica para vender peixes
        let data;
        try {
            data = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
        } catch (error) {
            console.error('Erro ao ler o arquivo de dados:', error);
            return await interaction.editReply('Erro ao carregar os dados do usuário. Tente novamente mais tarde.');
        }

        const userId = interaction.user.id;
        const user = data[userId] || { coins: 100, inventory: {} };

        // Obter o tipo de peixe e a quantidade escolhida
        const fishType = interaction.options.getString('mercadoria');
        const quantity = interaction.options.getInteger('quantidade');

        // Verificar se o usuário possui a quantidade de peixes
        const fishInventory = user.inventory[fishType] || 0;

        if (fishInventory < quantity) {
            return await interaction.editReply(`Você não tem ${quantity} ${fishType} para vender!`);
        }

        // Calcular o total de moedas que o usuário irá ganhar
        const sellPrice = shopItems[fishType]; // Preço do peixe na loja
        const totalRevenue = sellPrice * quantity;

        // Atualizar os dados do usuário
        user.coins += totalRevenue;
        user.inventory[fishType] -= quantity;

        // Se a quantidade de peixes chegar a zero, removê-los do inventário
        if (user.inventory[fishType] <= 0) {
            delete user.inventory[fishType];
        }
        data[userId] = user;

        // Salvar os dados atualizados
        try {
            fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Erro ao salvar os dados no arquivo:', error);
            return await interaction.editReply('Erro ao salvar os dados. Tente novamente mais tarde.');
        }

        // Criar embed de resposta
        const embed = new EmbedBuilder()
            .setColor('#00ff00') // Cor verde para o sucesso
            .setTitle('Ação do Capitão Executada!')
            .setDescription(`Você vendeu **${quantity} ${fishType}** e ganhou **${totalRevenue} moedas**.`)
            .addFields(
                { name: 'Novo Saldo de Moedas', value: `**${user.coins}** moedas`, inline: true },
                { name: `Estoque Atual de ${fishType}`, value: `**${user.inventory[fishType] || 0}**`, inline: true },
            )
            .setFooter({ text: 'Haruka-Shop', iconURL: 'https://images-ext-1.discordapp.net/external/clGiAls8V8fs509nd0OwBkqfI-r72ID0eQFXDnBIlLk/%3Fcb%3D20200304213920/https/static.wikia.nocookie.net/minecraft_gamepedia/images/0/0f/Netherite_Sword_JE2_BE2.png/revision/latest?format=webp&width=143&height=143' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
