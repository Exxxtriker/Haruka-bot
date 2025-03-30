/* eslint-disable max-len */
const {
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType,
} = require('discord.js');
const dataManager = require('../../utils/dataManager');

// Função para diminuir os status do pet ao longo do tempo
const degradePetStatus = (userId, petId) => {
    const user = dataManager.getGameData()[userId];
    if (!user || !user.petInventory || !user.petInventory[petId]) return;

    const pet = user.petInventory[petId];

    // Reduzir os status do pet
    pet.hunger = Math.max(0, pet.hunger - 5);
    pet.thirst = Math.max(0, pet.thirst - 5);
    pet.affection = Math.max(0, pet.affection - 2);

    // Atualizar os dados do usuário
    user.petInventory[petId] = pet;
    dataManager.setGameData({ [userId]: user });
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet')
        .setDescription('Gerencie seu pet!')
        .setDMPermission(false),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Carregar os dados do usuário do datagame.json
        const user = dataManager.getGameData()[userId];

        if (!user || !user.petInventory || Object.keys(user.petInventory).length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⛔ Erro')
                .setDescription('Você ainda não possui um pet ativo ou ele não está sincronizado com o inventário.');
            return interaction.reply({ embeds: [embed] });
        }

        // Carregar o pet ativo do inventário usando a referência
        const petId = user.pet.id;
        const pet = user.petInventory[petId];

        if (!pet) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⛔ Erro')
                .setDescription('O pet ativo não foi encontrado no inventário.');
            return interaction.reply({ embeds: [embed] });
        }

        // Verificar se o pet está morto
        if (pet.hunger <= 0 || pet.thirst <= 0) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('☠️ Pet Morto')
                .setDescription(`Seu pet **${pet.name}** morreu devido à fome ou sede. Ele não pode mais ser interagido.`);
            return interaction.reply({ embeds: [embed] });
        }

        // Função para criar a embed atualizada
        const createPetEmbed = () => {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🐾 Gerencie seu Pet')
                .setDescription(`Aqui está o status atual do seu pet, **${pet.name}**:`)
                .addFields(
                    { name: '🍖 Fome', value: `${pet.hunger}/100`, inline: true },
                    { name: '💧 Sede', value: `${pet.thirst}/100`, inline: true },
                    { name: '❤️ Afeto', value: `${pet.affection}/100`, inline: true },
                    { name: '🆔 ID do Pet', value: `${petId}`, inline: false }, // Adicionado o ID do pet
                );

            // Adicionar imagem grande se o pet for o Megalodon
            if (pet.name === 'Megalodon') {
                embed.setImage('https://static.wikia.nocookie.net/unanything/images/a/ad/Jeff_the_Shark.webp/revision/latest?cb=2');
            } else if (pet.name === 'Cachorro') {
                embed.setImage('https://www.patasdacasa.com.br/sites/default/files/styles/article_detail_1200/public/2024-08/golden-retriever-filhote.jpg.webp?itok=RpsL0yBq');
            } else if (pet.name === 'Gato') {
                embed.setImage('https://i0.statig.com.br/bancodeimagens/8s/9n/ug/8s9nugjvjc236jbubjhq50b5o.jpg');
            } else if (pet.name === 'Peixe-Beta') {
                embed.setImage('https://www.petz.com.br/blog/wp-content/uploads/2021/03/qual-peixe-posso-colocar-junto-com-o-beta2.jpg');
            } else if (pet.name === 'Axolot') {
                embed.setImage('https://i.pinimg.com/originals/1c/36/87/1c36870979d4001daa4f475164c1c203.gif');
            }

            return embed;
        };

        // Criar menu suspenso com as opções
        const menu = new StringSelectMenuBuilder()
            .setCustomId('pet_action_menu')
            .setPlaceholder('Escolha uma ação para o seu pet')
            .addOptions(
                { label: 'Status', value: 'status', description: 'Veja o status do seu pet.' },
                { label: 'Alimentar', value: 'alimentar', description: 'Alimente seu pet.' },
                { label: 'Hidratar', value: 'hidratar', description: 'Hidrate seu pet.' },
                { label: 'Brincar', value: 'brincar', description: 'Brinque com seu pet.' },
            );

        const row = new ActionRowBuilder().addComponents(menu);

        // Enviar a embed inicial com o menu suspenso
        await interaction.reply({ embeds: [createPetEmbed()], components: [row] });

        // Chamar a função de degradação periodicamente
        setInterval(() => degradePetStatus(userId, petId), 20 * 60 * 1000); // A cada 20 minutos

        // Criar coletor para o menu suspenso
        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60 * 1000, // 1 minuto
        });

        collector.on('collect', async (menuInteraction) => {
            if (menuInteraction.user.id !== userId) {
                try {
                    await menuInteraction.reply({
                        content: '⛔ Este menu não é para você!',
                        flags: 64,
                    });
                } catch (error) {
                    if (error.code === 10062) {
                        console.error('A interação expirou antes de responder.');
                    } else {
                        console.error('Erro ao responder à interação:', error);
                    }
                }
                return;
            }

            const action = menuInteraction.values[0];

            if (action === 'status') {
                // Atualizar embed com o status do pet
                try {
                    await menuInteraction.update({
                        embeds: [createPetEmbed()],
                        components: [row],
                    });
                } catch (error) {
                    if (error.code === 10062) {
                        console.error('A interação expirou antes de atualizar.');
                    } else {
                        console.error('Erro ao atualizar a interação:', error);
                    }
                }
            } else if (action === 'alimentar') {
                // Verificar os itens necessários para alimentar o pet
                const foodRequirements = {
                    Megalodon: { item: 'Peixe comum', amount: 20 },
                    Cachorro: { item: 'Ração de cachorro', amount: 10 },
                    Gato: { item: 'Ração de gato', amount: 10 },
                    'Peixe-Beta': { item: 'Ração de peixe', amount: 5 },
                    Axolot: { item: 'Algas', amount: 5 },
                };

                const food = foodRequirements[pet.name];
                if (!food) {
                    try {
                        await menuInteraction.reply({
                            content: `⛔ Não foi possível determinar o alimento necessário para **${pet.name}**.`,
                            flags: 64,
                        });
                    } catch (error) {
                        if (error.code === 10062) {
                            console.error('A interação expirou antes de responder.');
                        } else {
                            console.error('Erro ao responder à interação:', error);
                        }
                    }
                    return;
                }

                const userFoodAmount = user.inventory[food.item] || 0;
                if (userFoodAmount < food.amount) {
                    try {
                        await menuInteraction.reply({
                            content: `⛔ Você não possui comida suficiente para alimentar **${pet.name}**. Necessário: **${food.amount}x ${food.item}**.`,
                            flags: 64,
                        });
                    } catch (error) {
                        if (error.code === 10062) {
                            console.error('A interação expirou antes de responder.');
                        } else {
                            console.error('Erro ao responder à interação:', error);
                        }
                    }
                    return;
                }

                if (pet.hunger >= 100) {
                    try {
                        await menuInteraction.reply({
                            content: '🍖 Seu pet já está bem alimentado!',
                            flags: 64,
                        });
                    } catch (error) {
                        if (error.code === 10062) {
                            console.error('A interação expirou antes de responder.');
                        } else {
                            console.error('Erro ao responder à interação:', error);
                        }
                    }
                    return;
                }

                // Consumir a comida e alimentar o pet
                user.inventory[food.item] -= food.amount;
                pet.hunger = Math.min(100, pet.hunger + 20);
                user.petInventory[petId] = pet; // Atualizar no inventário
                dataManager.setGameData({ [userId]: user });

                try {
                    await menuInteraction.update({
                        content: `🍖 Você alimentou **${pet.name}** com **${food.amount}x ${food.item}**! A fome agora é **${pet.hunger}/100**.`,
                        embeds: [createPetEmbed()],
                        components: [row],
                    });
                } catch (error) {
                    if (error.code === 10062) {
                        console.error('A interação expirou antes de atualizar.');
                    } else {
                        console.error('Erro ao atualizar a interação:', error);
                    }
                }
            } else if (action === 'hidratar') {
                if (pet.thirst >= 100) {
                    try {
                        await menuInteraction.reply({
                            content: '💧 Seu pet já está bem hidratado!',
                            flags: 64,
                        });
                    } catch (error) {
                        if (error.code === 10062) {
                            console.error('A interação expirou antes de responder.');
                        } else {
                            console.error('Erro ao responder à interação:', error);
                        }
                    }
                    return;
                }
                pet.thirst = Math.min(100, pet.thirst + 20);
                user.petInventory[petId] = pet; // Atualizar no inventário
                dataManager.setGameData({ [userId]: user });
                try {
                    await menuInteraction.update({
                        content: `💧 Você deu água para **${pet.name}**! A sede agora é **${pet.thirst}/100**.`,
                        embeds: [createPetEmbed()],
                        components: [row],
                    });
                } catch (error) {
                    if (error.code === 10062) {
                        console.error('A interação expirou antes de atualizar.');
                    } else {
                        console.error('Erro ao atualizar a interação:', error);
                    }
                }
            } else if (action === 'brincar') {
                if (pet.affection >= 100) {
                    try {
                        await menuInteraction.reply({
                            content: '❤️ Seu pet já está muito feliz!',
                            flags: 64,
                        });
                    } catch (error) {
                        if (error.code === 10062) {
                            console.error('A interação expirou antes de responder.');
                        } else {
                            console.error('Erro ao responder à interação:', error);
                        }
                    }
                    return;
                }
                pet.affection = Math.min(100, pet.affection + 20);
                user.petInventory[petId] = pet; // Atualizar no inventário
                dataManager.setGameData({ [userId]: user });
                try {
                    await menuInteraction.update({
                        content: `❤️ Você brincou com **${pet.name}**! O afeto agora é **${pet.affection}/100**.`,
                        embeds: [createPetEmbed()],
                        components: [row],
                    });
                } catch (error) {
                    if (error.code === 10062) {
                        console.error('A interação expirou antes de atualizar.');
                    } else {
                        console.error('Erro ao atualizar a interação:', error);
                    }
                }
            }
        });

        collector.on('end', async () => {
            // Desativar o menu após o tempo expirar
            const disabledRow = new ActionRowBuilder().addComponents(menu.setDisabled(true));
            try {
                await interaction.editReply({ components: [disabledRow] });
            } catch (error) {
                if (error.code === 10008) {
                    console.error('A mensagem original não foi encontrada (Unknown Message).');
                } else {
                    console.error('Erro ao desativar o menu:', error);
                }
            }
        });
    },
};
