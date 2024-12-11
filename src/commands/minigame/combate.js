/* eslint-disable no-plusplus */
/* eslint-disable max-len */
const {
    SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const {
    gerarInimigos,
    calcularVidaInicial,
    calcularDefesaInicial,
    calcularDano,
    getBenção,
    getRandomNumber,
    ganharLoot,
} = require('../../utils/datacombat'); // Importando as funções

const itemsPath = path.join(__dirname, '../../utils/datagame.json');
const { STAMINA_RECHARGE_TIME, COMBAT_COST } = require('../../utils/config');
const dataManager = require('../../utils/dataManager');

const activeUsers = new Set();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('combate')
        .setDescription('Lute contra um inimigo!')
        .setDMPermission(false), // Desabilita o comando na DM
    async execute(interaction) {
        const userId = interaction.user.id;

        if (activeUsers.has(userId)) {
            return interaction.reply({ content: 'Você já está em combate! Aguarde até que o combate atual termine.', ephemeral: true });
        }

        activeUsers.add(userId);

        let data = dataManager.getGameData();

        if (!data[userId]) {
            dataManager.initializeUser(userId);
            data = dataManager.getGameData();
        }

        const userData = data[userId];
        const currentTime = Date.now();
        const lastInteractionTime = userData.lastInteraction || 0;
        const timeDifference = currentTime - lastInteractionTime;

        if (timeDifference >= STAMINA_RECHARGE_TIME) {
            userData.stamina = Math.min(userData.stamina + 15, 15);
            userData.lastInteraction = currentTime;
            fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
        }

        if (!dataManager.hasSufficientStamina(userId)) {
            const timeRemaining = dataManager.getTimeRemaining(userId, STAMINA_RECHARGE_TIME);
            const embed = new EmbedBuilder()
                .setColor('#FF5733')
                .setTitle('⛔ Estamina Insuficiente!')
                .setDescription(`Sua estamina está esgotada! Espere **${timeRemaining}** para recarregar.`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Aguarde até que sua estamina recarregue!' })
                .setTimestamp();

            activeUsers.delete(userId);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const newStamina = Math.max(0, userData.stamina - COMBAT_COST);
        dataManager.updateStamina(userId, newStamina);
        userData.stamina = newStamina;
        fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));

        if (!userData || !userData.inventory) {
            activeUsers.delete(userId);
            return interaction.reply('Seu inventário está vazio ou você ainda não tem dados registrados!');
        }

        const userInventory = userData.inventory;
        if (
            (!userInventory['Espada de ferro'] || userInventory['Espada de ferro'] <= 0)
            && (!userInventory['Espada de diamante'] || userInventory['Espada de diamante'] <= 0)
        ) {
            const embed = new EmbedBuilder()
                .setColor('#FF5733')
                .setTitle('⚔️ Equipamento Insuficiente!')
                .setDescription('Você precisa de uma espada de ferro ou de diamante para lutar contra monstros.')
                .addFields([
                    { name: '⚠️ Penalidade', value: 'Você perdeu **3 de estamina** no treinamento. Equipe-se melhor!', inline: false },
                ])
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Aguardo você no campo de batalha!' })
                .setTimestamp();
            activeUsers.delete(userId);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const btnUsePotion = new ButtonBuilder()
            .setCustomId('usePotion')
            .setLabel('Usar Poção de Vida 🍷')
            .setStyle(4);

        const btnNextTurn = new ButtonBuilder()
            .setCustomId('nextTurn')
            .setLabel('Avançar Turno ⏩')
            .setStyle(1);

        const row = new ActionRowBuilder().addComponents(btnNextTurn, btnUsePotion);

        const inimigos = gerarInimigos();
        const inimigo = inimigos[Math.floor(Math.random() * inimigos.length)];

        const bençãoAtual = getBenção();
        const vidaJogador = calcularVidaInicial(bençãoAtual);
        const defesaBase = calcularDefesaInicial(bençãoAtual);

        const jogador = {
            nome: interaction.user.username,
            hp: vidaJogador,
            defesa: defesaBase,
            coins: userData.coins || 0,
        };

        await interaction.deferReply();
        let turno = 0;

        const combate = async () => {
            const mensagemTurno = [
                `${inimigo.nome} atacou ${jogador.nome}!`,
                `${jogador.nome} atacou o ${inimigo.nome}!`,
            ];

            const embed = new EmbedBuilder()
                .setColor('#ff4500')
                .setTitle('⚔️ Batalha Épica! ⚔️')
                .setDescription(`Prepare-se, **${jogador.nome}**! Você está enfrentando um temível **${inimigo.nome}**.`)
                .addFields(
                    { name: '💀 Inimigo', value: `**${inimigo.nome}**\nHP: ${inimigo.hp}\n⚔️ Ataque: ${inimigo.ataque}\n🛡️ Defesa: ${inimigo.defesa}`, inline: true },
                    { name: '🧑 Você', value: `HP: ${jogador.hp}\n🛡️ Defesa: ${jogador.defesa}\n💰 Coins: ${jogador.coins}`, inline: true },
                    { name: '🌟 Benção da Deusa Haruka', value: `Nível de Benção: **${bençãoAtual}**`, inline: false },
                )
                .setFooter({ text: 'Clique no botão para avançar o turno ou usar uma poção!' })
                .setImage('https://media.discordapp.net/attachments/1310325661839392889/1311091543020666900/i580020.png?ex=674798a6&is=67464726&hm=0b8f80ec7e91b7e57d18eaaae2b61a87c0c5105e0ade8456a0f69d61e1fb6253&=&format=webp&quality=lossless')
                .setThumbnail('https://static.wikia.nocookie.net/a-ordem-rpg/images/9/92/S%C3%ADmbolo_de_Transcender.png/revision/latest?cb=20221025002006&path-prefix=pt-br');

            await interaction.editReply({ embeds: [embed], components: [row] });

            const filter = (i) => (i.customId === 'nextTurn' || i.customId === 'usePotion') && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 5 * 60 * 1000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'usePotion') {
                    if (userInventory['Poção de vida'] > 0) {
                        const cura = 50;
                        jogador.hp = Math.min(jogador.hp + cura, vidaJogador);
                        userInventory['Poção de vida'] -= 1;
                        data[userId].inventory = userInventory;

                        fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));

                        await i.reply({ content: `Você usou uma Poção de Vida e recuperou **${cura} HP**!`, ephemeral: true });
                    } else {
                        await i.reply({ content: 'Você não tem poções de vida suficientes!', ephemeral: true });
                    }
                    return;
                }

                const atacante = turno % 2 === 0 ? jogador : inimigo;
                const defensor = turno % 2 === 0 ? inimigo : jogador;

                const danoJogador = calcularDano(userInventory, bençãoAtual);
                const danoInimigo = getRandomNumber(inimigo.ataque - defensor.defesa, inimigo.ataque);

                const dano = Math.max(0, atacante === jogador ? danoJogador - defensor.defesa : danoInimigo - defensor.defesa);
                defensor.hp -= dano;

                if (jogador.hp <= 0) {
                    jogador.coins = Math.max(jogador.coins - 50, 0);
                    data[userId].coins = jogador.coins;
                    fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
                    await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#ff0000')
                                .setTitle('☠️ Você foi derrotado! ☠️')
                                .setImage('https://media.discordapp.net/attachments/1310325661839392889/1311091543020666900/i580020.png?ex=674798a6&is=67464726&hm=0b8f80ec7e91b7e57d18eaaae2b61a87c0c5105e0ade8456a0f69d61e1fb6253&=&format=webp&quality=lossless')
                                .setThumbnail('https://static.wikia.nocookie.net/a-ordem-rpg/images/9/92/S%C3%ADmbolo_de_Transcender.png/revision/latest?cb=20221025002006&path-prefix=pt-br')
                                .setDescription(`O terrível **${inimigo.nome}** foi mais forte...\n\nVocê perdeu **50 coins**. Não desista, melhore suas habilidades e volte à luta!`),
                        ],
                        components: [],
                    });
                    activeUsers.delete(userId);
                    collector.stop();
                } else if (inimigo.hp <= 0) {
                    const loot = ganharLoot(userData);
                    jogador.coins += loot.coins;
                    data[userId].coins = jogador.coins;
                    fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));

                    await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#00ff00')
                                .setTitle('🎉 Vitória! 🎉')
                                .setDescription(`Você derrotou o **${inimigo.nome}**!\n\nVocê recebeu **${loot.coins} coins** e **${loot.quantity}x ${loot.item}**!`)
                                .setImage('https://media.discordapp.net/attachments/1310325661839392889/1311091543020666900/i580020.png?ex=674798a6&is=67464726&hm=0b8f80ec7e91b7e57d18eaaae2b61a87c0c5105e0ade8456a0f69d61e1fb6253&=&format=webp&quality=lossless')
                                .setThumbnail('https://static.wikia.nocookie.net/a-ordem-rpg/images/9/92/S%C3%ADmbolo_de_Transcender.png/revision/latest?cb=20221025002006&path-prefix=pt-br')
                                .addFields({ name: '🏆 Loot', value: `**${loot.quantity}x ${loot.item}**`, inline: false }),
                        ],
                        components: [],
                    });
                    activeUsers.delete(userId);
                    collector.stop();
                } else {
                    turno++;
                    await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(turno % 2 === 0 ? '#00bfff' : '#ff6347')
                                .setTitle('⚔️ Turno em Progresso!')
                                .setImage('https://media.discordapp.net/attachments/1310325661839392889/1311091543020666900/i580020.png?ex=674798a6&is=67464726&hm=0b8f80ec7e91b7e57d18eaaae2b61a87c0c5105e0ade8456a0f69d61e1fb6253&=&format=webp&quality=lossless')
                                .setThumbnail('https://static.wikia.nocookie.net/a-ordem-rpg/images/9/92/S%C3%ADmbolo_de_Transcender.png/revision/latest?cb=20221025002006&path-prefix=pt-br')
                                .setDescription(`☠️${mensagemTurno[turno % 2]}\nDano causado: **${dano}** \n💌 HPs:\n⚔️${jogador.nome}: ${jogador.hp} HP\n\n☠️${inimigo.nome}: ${inimigo.hp} HP`),
                        ],
                        components: [row],
                    });
                }
            });

            collector.on('end', async (_, reason) => {
                if (reason === 'time') {
                    const valorPerdido = getRandomNumber(10, 80);
                    jogador.coins = Math.max(jogador.coins - valorPerdido, 0);
                    data[userId].coins = jogador.coins;
                    fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));

                    await interaction.followUp(`<@${userId}>, você fugiu do combate! Ao fugir, sua bolsa rasgou e você perdeu **${valorPerdido} moedas**.`);
                    activeUsers.delete(userId);
                }
            });
        };

        await combate();
        fs.writeFileSync(itemsPath, JSON.stringify(dataManager.getGameData(), null, 2));
    },
};
