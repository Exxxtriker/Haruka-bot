/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
const {
    SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../../utils/datagame.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('combate')
        .setDescription('Lute contra um inimigo!'),
    async execute(interaction) {
        const userId = interaction.user.id;

        // Verificar se o arquivo existe
        if (!fs.existsSync(itemsPath)) {
            return interaction.reply('O arquivo de dados não foi encontrado!');
        }

        // Carregar os dados do arquivo JSON
        let data = {};
        try {
            data = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
        } catch (error) {
            console.error('Erro ao ler o arquivo JSON:', error);
            return interaction.reply('Erro ao carregar os dados do arquivo!');
        }

        // Verificar se o usuário existe no JSON
        const userData = data[userId];
        if (!userData || !userData.inventory) {
            return interaction.reply('Seu inventário está vazio ou você ainda não tem dados registrados!');
        }

        // Verificar se o usuário possui uma espada de ferro ou de diamante no inventário
        const userInventory = userData.inventory;
        if (
            (!userInventory['espada de ferro'] || userInventory['espada de ferro'] <= 0)
            && (!userInventory['espada de diamante'] || userInventory['espada de diamante'] <= 0)
        ) {
            return interaction.reply('Você precisa de uma espada de ferro ou de diamante para lutar!');
        }

        // Definir inimigos com vida aleatória e ataques variáveis
        const inimigos = [
            {
                nome: 'Goblin Selvagem', hp: getRandomNumber(40, 60), ataque: getRandomNumber(8, 12), defesa: getRandomNumber(2, 5),
            },
            {
                nome: 'Ladrão', hp: getRandomNumber(60, 80), ataque: getRandomNumber(15, 25), defesa: getRandomNumber(1, 4),
            },
            {
                nome: 'Elfo', hp: getRandomNumber(50, 70), ataque: getRandomNumber(16, 20), defesa: getRandomNumber(6, 10),
            },
            {
                nome: 'Dragão de Fogo', hp: getRandomNumber(180, 220), ataque: getRandomNumber(25, 35), defesa: getRandomNumber(15, 25),
            },
            {
                nome: 'Lorde das Sombras', hp: getRandomNumber(140, 160), ataque: getRandomNumber(30, 40), defesa: getRandomNumber(10, 18),
            },
            {
                nome: 'Titanos', hp: getRandomNumber(280, 320), ataque: getRandomNumber(45, 55), defesa: getRandomNumber(20, 30),
            },
        ];

        // Escolher um inimigo aleatório
        const inimigo = inimigos[Math.floor(Math.random() * inimigos.length)];

        // Função para calcular a vida inicial do jogador com base na benção
        function calcularVidaInicial(benção) {
            const vidaBase = 100;
            if (benção === 'fraca') return Math.floor(vidaBase * 0.8); // 20% a menos de vida
            if (benção === 'forte') return Math.floor(vidaBase * 1.2); // 20% a mais de vida
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
            if (userInventory['espada de diamante'] > 0) danoBase = 55;
            if (userInventory['espada de ferro'] > 0) danoBase = 35;

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
            .setLabel('Avançar Turno')
            .setStyle(1); // 1 = PRIMARY

        const row = new ActionRowBuilder().addComponents(btnNextTurn);

        // Função de combate
        const combate = async () => {
            const mensagemTurno = [
                `${jogador.nome} atacou o ${inimigo.nome}!`,
                `${inimigo.nome} atacou ${jogador.nome}!`,
            ];

            // Enviar a mensagem inicial
            const embed = new EmbedBuilder()
                .setColor('#ff4500')
                .setTitle('⚔️ Batalha Épica! ⚔️')
                .setDescription(`Prepare-se, **${jogador.nome}**! Você está enfrentando um temível **${inimigo.nome}**.`)
                .addFields(
                    { name: '💀 Inimigo', value: `**${inimigo.nome}**\nHP: ${inimigo.hp}\n⚔️ Ataque: ${inimigo.ataque}\n🛡️ Defesa: ${inimigo.defesa}`, inline: true },
                    { name: '🧑 Você', value: `HP: ${jogador.hp}\n🛡️ Defesa: ${jogador.defesa}\n💰 Coins: ${jogador.coins}`, inline: true },
                    { name: '⚒️ Sua Arma', value: `**Espada:** ${userInventory['espada de diamante'] > 0 ? '⚔️ Espada de Diamante' : '⚔️ Espada de Ferro'}\n**Dano:** ${jogadorDano}`, inline: false },
                    { name: '🌟 Benção da Deusa Haruka', value: `Nível de Benção: **${bençãoAtual}**`, inline: false },
                )
                .setFooter({ text: 'Clique no botão para avançar o turno!' });

            await interaction.editReply({ embeds: [embed], components: [row] });

            const filter = (i) => i.customId === 'nextTurn' && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                const atacante = turno % 2 === 0 ? jogador : inimigo;
                const defensor = turno % 2 === 0 ? inimigo : jogador;

                // Calcular dano
                const dano = Math.max(0, atacante === jogador ? jogadorDano - defensor.defesa : atacante.ataque - defensor.defesa);
                defensor.hp -= dano;

                if (jogador.hp <= 0) {
                    jogador.coins -= 50;
                    data[userId].coins = jogador.coins;
                    fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
                    await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#ff0000')
                                .setTitle('☠️ Você foi derrotado! ☠️')
                                .setDescription(`O terrível **${inimigo.nome}** foi mais forte...\n\nVocê perdeu **50 coins**. Não desista, melhore suas habilidades e volte à luta!`),
                        ],
                        components: [],
                    });
                    collector.stop();
                } else if (inimigo.hp <= 0) {
                    const loot = ganharLoot();
                    jogador.coins += loot.coins;
                    data[userId].coins = jogador.coins;
                    fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));

                    await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#00ff00')
                                .setTitle('🎉 Vitória! 🎉')
                                .setDescription(`Você derrotou o **${inimigo.nome}**!\n\nVocê recebeu **${loot.coins} coins** e **${loot.quantity}x ${loot.item}**!`)
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
                                .setDescription(`${mensagemTurno[turno % 2]} Dano causado: **${dano}**\nHPs:\n${jogador.nome}: ${jogador.hp} HP\n${inimigo.nome}: ${inimigo.hp} HP`),
                        ],
                        components: [row],
                    });
                }
            });

            collector.on('end', (_, reason) => {
                if (reason === 'time') {
                    interaction.followUp('O tempo do combate acabou!');
                }
            });
        };

        function ganharLoot() {
            const minerios = ['diamante', 'ouro', 'ferro', 'pedra'];
            const itemAleatorio = minerios[Math.floor(Math.random() * minerios.length)];
            const quantity = Math.floor(Math.random() * 5) + 1;
            const coins = Math.floor(Math.random() * 30) + 20;
            return { item: itemAleatorio, quantity, coins };
        }

        await combate();
    },
};
