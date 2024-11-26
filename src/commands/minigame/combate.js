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

        // Definir estatísticas do inimigo
        const inimigos = [
            {
                nome: 'Goblin Selvagem', hp: 50, ataque: 10, defesa: 3,
            },
            {
                nome: 'Ladrão', hp: 70, ataque: 20, defesa: 2,
            },
            {
                nome: 'Elfo', hp: 60, ataque: 18, defesa: 8,
            },
            {
                nome: 'Dragão de Fogo', hp: 200, ataque: 30, defesa: 20,
            },
            {
                nome: 'Lorde das Sombras', hp: 150, ataque: 35, defesa: 15,
            },
            {
                nome: 'Titanos', hp: 300, ataque: 50, defesa: 25,
            },
        ];

        // Escolher um inimigo aleatório
        const inimigo = inimigos[Math.floor(Math.random() * inimigos.length)];

        // Definir estatísticas do jogador
        const jogador = {
            nome: interaction.user.username,
            hp: 100,
            defesa: 5,
            coins: userData.coins || 0,
        };

        // Função para calcular o dano com base na espada
        const calcularDano = () => {
            if (userInventory['espada de diamante'] > 0) return 55;
            if (userInventory['espada de ferro'] > 0) return 35;
            return 0;
        };

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
                    // eslint-disable-next-line no-use-before-define
                    const loot = ganharLoot();
                    jogador.coins += loot.coins;
                    userInventory[loot.item] = (userInventory[loot.item] || 0) + loot.quantity;
                    data[userId].coins = jogador.coins;
                    data[userId].inventory = userInventory;
                    fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
                    await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#32cd32')
                                .setTitle('🎉 Vitória Gloriosa! 🎉')
                                .setDescription(`Você derrotou **${inimigo.nome}** e saiu vitorioso!\n\n**Recompensas:**\n💰 Coins: ${loot.coins}\n🏆 Loot: **${loot.quantity}x ${loot.item}**`),
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
