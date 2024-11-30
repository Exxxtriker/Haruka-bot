/* eslint-disable no-use-before-define */
/* eslint-disable max-len */

const {
    SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../../utils/datagame.json');
const { STAMINA_RECHARGE_TIME, COMBAT_COST } = require('../../utils/config');
const dataManager = require('../../utils/dataManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('combate')
        .setDescription('Lute contra um inimigo!'),
    async execute(interaction) {
        const userId = interaction.user.id;

        // Carregar os dados do jogo
        let data = dataManager.getGameData();

        // Verificar se o usuário existe nos dados carregados
        if (!data[userId]) {
            // Se o usuário não existir, inicializar os dados dele
            dataManager.initializeUser(userId);
            // Carregar novamente os dados após a inicialização
            data = dataManager.getGameData();
        }

        // Obter os dados do usuário
        const userData = data[userId];

        const currentTime = Date.now();
        const lastInteractionTime = userData.lastInteraction || 0;
        const timeDifference = currentTime - lastInteractionTime;

        // Atualizar estamina após o tempo de recarga
        if (timeDifference >= STAMINA_RECHARGE_TIME) {
            userData.stamina = Math.min(userData.stamina + 1, 15); // Max estamina = 15
            userData.lastInteraction = currentTime;
            fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
        }

        // Recarregar estamina automaticamente, se necessário
        if (timeDifference >= STAMINA_RECHARGE_TIME) {
            dataManager.rechargeStamina(userId);
        }

        // Verificar se jogador tem estamina suficiente
        if (!dataManager.hasSufficientStamina(userId)) {
            const timeRemaining = dataManager.getTimeRemaining(userId, STAMINA_RECHARGE_TIME);
            const embed = new EmbedBuilder()
                .setColor('#FF5733')
                .setTitle('⛔ Estamina Insuficiente!')
                .setDescription(`Sua estamina está esgotada! Espere **${timeRemaining}** para recarregar.`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Aguarde até que sua estamina recarregue!' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Deduzir estamina pelo combate
        const newStamina = Math.max(0, userData.stamina - COMBAT_COST);
        dataManager.updateStamina(userId, newStamina);

        // Atualizar o tempo de última interação
        dataManager.getTimeRemaining(userId, currentTime);

        userData.stamina = newStamina;
        fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));

        if (!userData || !userData.inventory) {
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
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        function criarInimigo(nome, hpMin, hpMax, ataqueMin, ataqueMax, defesaMin, defesaMax) {
            return {
                nome,
                hp: getRandomNumber(hpMin, hpMax),
                ataque: getRandomNumber(ataqueMin, ataqueMax),
                defesa: getRandomNumber(defesaMin, defesaMax),
            };
        }

        // Função para gerar a lista de inimigos
        function gerarInimigos() {
            return [
                criarInimigo('Goblin Selvagem', 40, 110, 8, 12, 2, 5),
                criarInimigo('Ladrão', 60, 150, 15, 25, 1, 4),
                criarInimigo('Elfo', 50, 120, 16, 20, 6, 10),
                criarInimigo('Dragão de Fogo', 180, 220, 25, 35, 15, 25),
                criarInimigo('Lorde das Sombras', 140, 160, 30, 40, 10, 18),
                criarInimigo('Titanos', 200, 320, 45, 55, 20, 30),
                criarInimigo('CLThanos', 190, 450, 20, 50, 20, 25),
            ];
        }

        // Gerar a lista de inimigos
        const inimigos = gerarInimigos();

        // Escolher um inimigo aleatório
        const inimigo = inimigos[Math.floor(Math.random() * inimigos.length)];

        // Função para calcular a vida inicial do jogador com base na benção
        function calcularVidaInicial(benção) {
            const vidaBase = 100;
            if (benção === 'fraca') return Math.floor(vidaBase * 0.9);
            if (benção === 'forte') return Math.floor(vidaBase * 1.5);
            return vidaBase; // Benção média (sem alteração)
        }

        // Definir estatísticas do jogador
        const bençãoAtual = getBenção(); // Obter a benção da deusa Haruka
        const vidaJogador = calcularVidaInicial(bençãoAtual);

        const jogador = {
            nome: interaction.user.username,
            hp: vidaJogador,
            defesa: 5,
            coins: userData.coins || 0,
        };

        // Função para calcular o dano com base na espada e na benção
        const calcularDano = () => {
            let danoBase = 0;
            if (userInventory['Espada de diamante'] > 0) danoBase = 55;
            if (userInventory['Espada de ferro'] > 0) danoBase = 35;

            // Modificar o dano baseado na benção
            if (bençãoAtual === 'fraca') return Math.floor(danoBase * 0.8); // Dano reduzido
            if (bençãoAtual === 'forte') return Math.floor(danoBase * 1.2); // Dano aumentado
            return danoBase; // Benção média (sem alteração)
        };

        // Função para obter benção aleatória
        function getBenção() {
            const benções = ['fraca', 'média', 'forte'];
            return benções[Math.floor(Math.random() * benções.length)];
        }

        // Função para gerar um número aleatório dentro de um intervalo
        function getRandomNumber(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        const jogadorDano = calcularDano();

        // Adiar a resposta da interação
        await interaction.deferReply();

        let turno = 0;

        // Criar botão para avançar turno
        const btnNextTurn = new ButtonBuilder()
            .setCustomId('nextTurn')
            .setLabel('Avançar Turno ⏩')
            .setStyle(1); // 1 = PRIMARY

        const row = new ActionRowBuilder().addComponents(btnNextTurn);

        // Função de combate
        const combate = async () => {
            const mensagemTurno = [
                `${inimigo.nome} atacou ${jogador.nome}!`,
                `${jogador.nome} atacou o ${inimigo.nome}!`,
            ];

            // Enviar a mensagem inicial
            const embed = new EmbedBuilder()
                .setColor('#ff4500')
                .setTitle('⚔️ Batalha Épica! ⚔️')
                .setDescription(`Prepare-se, **${jogador.nome}**! Você está enfrentando um temível **${inimigo.nome}**.`)
                .addFields(
                    { name: '💀 Inimigo', value: `**${inimigo.nome}**\nHP: ${inimigo.hp}\n⚔️ Ataque: ${inimigo.ataque}\n🛡️ Defesa: ${inimigo.defesa}`, inline: true },
                    { name: '🧑 Você', value: `HP: ${jogador.hp}\n🛡️ Defesa: ${jogador.defesa}\n💰 Coins: ${jogador.coins}`, inline: true },
                    { name: '⚒️ Sua Arma', value: `**Espada:** ${userInventory['Espada de diamante'] > 0 ? '⚔️ Espada de Diamante' : '⚔️ Espada de Ferro'}\n**Dano:** ${jogadorDano}`, inline: false },
                    { name: '🌟 Benção da Deusa Haruka', value: `Nível de Benção: **${bençãoAtual}**`, inline: false },
                )
                .setFooter({ text: 'Clique no botão para avançar o turno!' })
                .setImage('https://media.discordapp.net/attachments/1310325661839392889/1311091543020666900/i580020.png?ex=674798a6&is=67464726&hm=0b8f80ec7e91b7e57d18eaaae2b61a87c0c5105e0ade8456a0f69d61e1fb6253&=&format=webp&quality=lossless')
                .setThumbnail('https://media.discordapp.net/attachments/1310325661839392889/1311091475039260743/FMA_Human_Transmutation_Circle.png?ex=67479896&is=67464716&hm=9b76122a5a7614e78819c61a0971b82e8cfcedfe1e8272b10816d055d3098d8e&=&format=webp&quality=lossless');

            await interaction.editReply({ embeds: [embed], components: [row] });

            const filter = (i) => i.customId === 'nextTurn' && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 5 * 60 * 1000 }); // 5 Minutos

            collector.on('collect', async (i) => {
                const atacante = turno % 2 === 0 ? jogador : inimigo;
                const defensor = turno % 2 === 0 ? inimigo : jogador;

                // Calcular dano
                const dano = Math.max(0, atacante === jogador ? jogadorDano - defensor.defesa : atacante.ataque - defensor.defesa);
                defensor.hp -= dano;

                if (jogador.hp <= 0) {
                    jogador.coins = Math.max(jogador.coins - 50, 0); // Garante que as moedas não fiquem negativas
                    data[userId].coins = jogador.coins;
                    fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
                    await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#ff0000')
                                .setTitle('☠️ Você foi derrotado! ☠️')
                                .setImage('https://media.discordapp.net/attachments/1310325661839392889/1311091543020666900/i580020.png?ex=674798a6&is=67464726&hm=0b8f80ec7e91b7e57d18eaaae2b61a87c0c5105e0ade8456a0f69d61e1fb6253&=&format=webp&quality=lossless')
                                .setThumbnail('https://media.discordapp.net/attachments/1310325661839392889/1311091475039260743/FMA_Human_Transmutation_Circle.png?ex=67479896&is=67464716&hm=9b76122a5a7614e78819c61a0971b82e8cfcedfe1e8272b10816d055d3098d8e&=&format=webp&quality=lossless')
                                .setDescription(`O terrível **${inimigo.nome}** foi mais forte...\n\nVocê perdeu **50 coins**. Não desista, melhore suas habilidades e volte à luta!`),
                        ],
                        components: [],
                    });
                    collector.stop();
                } else if (inimigo.hp <= 0) {
                    const loot = ganharLoot();
                    // Atualize as moedas
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
                                .setThumbnail('https://media.discordapp.net/attachments/1310325661839392889/1311091475039260743/FMA_Human_Transmutation_Circle.png?ex=67479896&is=67464716&hm=9b76122a5a7614e78819c61a0971b82e8cfcedfe1e8272b10816d055d3098d8e&=&format=webp&quality=lossless')
                                .addFields({ name: '🏆 Loot', value: `**${loot.quantity}x ${loot.item}**`, inline: false }),
                        ],
                        components: [],
                    });
                    collector.stop();
                } else {
                    // eslint-disable-next-line no-plusplus
                    turno++;
                    await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(turno % 2 === 0 ? '#00bfff' : '#ff6347')
                                .setTitle('⚔️ Turno em Progresso!')
                                .setImage('https://media.discordapp.net/attachments/1310325661839392889/1311091543020666900/i580020.png?ex=674798a6&is=67464726&hm=0b8f80ec7e91b7e57d18eaaae2b61a87c0c5105e0ade8456a0f69d61e1fb6253&=&format=webp&quality=lossless')
                                .setThumbnail('https://media.discordapp.net/attachments/1310325661839392889/1311091475039260743/FMA_Human_Transmutation_Circle.png?ex=67479896&is=67464716&hm=9b76122a5a7614e78819c61a0971b82e8cfcedfe1e8272b10816d055d3098d8e&=&format=webp&quality=lossless')
                                .setDescription(`☠️${mensagemTurno[turno % 2]}\nDano causado: **${dano}**\n💌 HPs:\n⚔️${jogador.nome}: ${jogador.hp} HP\n\n☠️${inimigo.nome}: ${inimigo.hp} HP`),
                        ],
                        components: [row],
                    });
                }
            });

            collector.on('end', (_, reason) => {
                if (reason === 'time') {
                    interaction.followUp('Você fugiu do combate, covarde !!!');
                }
            });
        };

        // Função para ganhar loot e atualizar o inventário
        function ganharLoot() {
            const itens = ['Diamante', 'Ouro', 'Ferro', 'Pedra', 'Chave [NULL]', 'Espada de ferro'];
            const itemChances = {
                Diamante: 5, // 5% de chance
                Ouro: 20, // 20% de chance
                Ferro: 30, // 30% de chance
                Pedra: 45, // 45% de chance
                'Chave [NULL]': 1, // 1% de chance
                'Espada de ferro': 10, // 10% de chance
            };

            // Função para selecionar um item com base nas chances
            function selectItem() {
                const randomNum = Math.random() * 100; // Gera um número aleatório entre 0 e 100
                let cumulativeChance = 0;

                for (const item of itens) {
                    cumulativeChance += itemChances[item];
                    if (randomNum < cumulativeChance) {
                        return item; // Retorna o item selecionado
                    }
                }
            }

            const itemAleatorio = selectItem(); // Seleciona o item
            const quantity = Math.floor(Math.random() * 5) + 1; // Define a quantidade
            const coins = Math.floor(Math.random() * 30) + 20; // Gera moedas

            // Atualizar apenas o inventário aqui
            if (!userData.inventory[itemAleatorio]) {
                userData.inventory[itemAleatorio] = 0; // Inicializa o item se não existir
            }
            userData.inventory[itemAleatorio] += quantity;

            data[userId].inventory = userData.inventory;

            return { item: itemAleatorio, quantity, coins };
        }
        await combate();
        fs.writeFileSync(itemsPath, JSON.stringify(dataManager.getGameData(), null, 2));
    },
};
