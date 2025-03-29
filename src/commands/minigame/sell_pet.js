const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dataManager = require('../../utils/dataManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vender-pet')
        .setDescription('Venda um dos seus pets.')
        .addStringOption((option) => option.setName('pet_id')
            .setDescription('O ID do pet que você deseja vender.')
            .setRequired(true))
        .setDMPermission(false),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Carregar os dados do usuário do datagame.json
        const user = dataManager.getGameData()[userId];

        if (!user || !user.petInventory) {
            return interaction.reply({
                content: '⛔ Você não possui nenhum pet para vender.',
                flags: 64,
            });
        }

        const petId = interaction.options.getString('pet_id');
        const pet = user.petInventory[petId];

        if (!pet) {
            return interaction.reply({
                content: `⛔ O pet com ID **${petId}** não foi encontrado no seu inventário.`,
                flags: 64,
            });
        }

        // Determinar o valor do pet com base no tipo
        const petValues = {
            Megalodon: 100000,
            Cachorro: 5000,
            Gato: 4000,
            'Peixe-Beta': 900,
            Axolot: 600,
        };

        const petValue = petValues[pet.name] || 100; // Valor padrão caso o pet não esteja listado

        // Remover o pet do inventário
        delete user.petInventory[petId];

        // Se o pet vendido era o ativo, remover o ativo
        if (user.pet && user.pet.id === petId) {
            user.pet = null;
        }

        // Adicionar moedas ao usuário
        user.coins = (user.coins || 0) + petValue;

        // Salvar os dados atualizados
        dataManager.setGameData({ [userId]: user });

        // Responder com uma mensagem de sucesso
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🐾 Pet Vendido!')
            .setDescription(`Você vendeu o pet **${pet.name}** por **${petValue} moedas**.`)
            .setFooter({ text: 'Obrigado por usar o mercado de pets!' })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
};
