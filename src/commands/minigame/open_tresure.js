/* eslint-disable max-len */
/* eslint-disable no-plusplus */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid'); // Para gerar IDs únicos
const dataManager = require('../../utils/dataManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abrir-tesouro')
        .setDescription('Abra um tesouro e descubra as riquezas dentro dele!')
        .setDMPermission(false), // Desabilita o comando na DM

    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            // Inicializar usuário no sistema
            dataManager.initializeUser(userId);
            const user = dataManager.getGameData()[userId];

            // Verificar se o jogador possui um tesouro para abrir
            const treasureKey = 'tesouro';
            if (!user.inventory[treasureKey] || user.inventory[treasureKey] <= 0) {
                return interaction.reply({
                    content: '⛔ Você não possui nenhum tesouro para abrir!',
                    flags: 64,
                });
            }

            // Reduzir a quantidade de tesouros no inventário
            user.inventory[treasureKey] -= 1;

            // Sistema de chances de drop
            const itemChances = {
                ouro: 50, // 50% de chance
                diamante: 40, // 40% de chance
                joia: 30, // 30% de chance
                'chave [null]': 1, // 1% de chance
            };

            const petChances = {
                Megalodon: 100, // 0.01% de chance (Lendário)
                Cachorro: 0.05, // 0.05% de chance (Normal)
                Gato: 0.05, // 0.05% de chance (Normal)
                'Peixe-Beta': 0.03, // 0.03% de chance (Exótico)
                Axolot: 0.02, // 0.02% de chance (Exótico)
            };

            const items = Object.keys(itemChances);
            const chanceValues = Object.values(itemChances);
            const totalChance = chanceValues.reduce((acc, chance) => acc + chance, 0);

            const random = Math.random() * totalChance;
            let cumulative = 0;
            let droppedItem = null;

            for (let i = 0; i < items.length; i++) {
                cumulative += chanceValues[i];
                if (random <= cumulative) {
                    droppedItem = items[i];
                    break;
                }
            }

            // Inicializar o inventário de pets, se necessário
            if (!user.petInventory) {
                user.petInventory = {};
            }

            // Verificar se o jogador ganha um pet
            const petRandom = Math.random() * 100;
            cumulative = 0;
            let pet = null;

            for (const [petName, chance] of Object.entries(petChances)) {
                cumulative += chance;
                if (petRandom <= cumulative) {
                    pet = petName;
                    break;
                }
            }

            let petId = null; // Inicializar petId como null

            // Se o jogador ganhou um pet, adicionar ao inventário de pets
            if (pet) {
                petId = uuidv4(); // Gerar um ID único para o pet
                user.petInventory[petId] = {
                    id: petId,
                    name: pet,
                    hunger: 50,
                    thirst: 50,
                    affection: 50,
                };

                // Se o jogador não tiver um pet ativo, definir o novo pet como ativo
                if (!user.pet) {
                    user.pet = user.petInventory[petId];
                }
            }

            // Atualizar o inventário do usuário com o item encontrado
            const quantity = Math.floor(Math.random() * 5) + 1; // Quantidade aleatória (1 a 5)
            dataManager.addItemToInventory(userId, droppedItem, quantity);

            // Salvar os dados atualizados
            dataManager.setGameData({ [userId]: user });

            // Criar embed para exibir o resultado
            const embed = new EmbedBuilder()
                .setColor('#FFD700') // Cor dourada
                .setTitle('🏆 Tesouro aberto!')
                .setDescription(`Você abriu um tesouro e encontrou **${quantity}x ${droppedItem}**!`)
                .addFields(
                    { name: 'Tesouros restantes', value: `${user.inventory[treasureKey]}`, inline: true },
                    { name: 'Inventário atualizado', value: `${droppedItem}: ${user.inventory[droppedItem] || quantity}`, inline: true },
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: pet ? `Parabéns! Você ganhou um pet: ${pet}! (ID: ${petId})` : 'Continue explorando para encontrar mais tesouros!' })
                .setTimestamp();

            // Responder a interação com o embed
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao executar o comando de abrir-tesouro:', error);
            interaction.reply({
                content: '❌ Ocorreu um erro ao tentar abrir o tesouro. Tente novamente mais tarde!',
                flags: 64,
            });
        }
    },
};
