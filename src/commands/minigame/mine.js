const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, 'datagame.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mine')
        .setDescription('Minere para obter recursos!'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const resources = ['pedra', 'ferro', 'ouro', 'diamante'];
        const mined = resources[Math.floor(Math.random() * resources.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;

        // Verificar se o arquivo existe, se não, criar com estrutura inicial
        if (!fs.existsSync(itemsPath)) {
            const initialData = {};
            fs.writeFileSync(itemsPath, JSON.stringify(initialData, null, 2));
        }

        // Tentar carregar os dados, com fallback em caso de erro
        let data = {};
        try {
            data = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
        } catch (error) {
            // Se ocorrer erro, como um arquivo corrompido ou vazio, re-inicialize os dados
            console.error('Erro ao ler o arquivo JSON:', error);
            data = {}; // Resetar dados para um objeto vazio
            fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2)); // Salvar dados inicializados novamente
        }

        // Verificar se o usuário já existe, se não, criar dados iniciais para ele
        if (!data[userId]) {
            data[userId] = {
                coins: 50,
                inventory: {},
                stamina: 10,
                lastMine: 0,
            };
            fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2)); // Salvar após criar o usuário
        }

        const user = data[userId];
        const currentTime = Date.now();
        const timePassed = currentTime - user.lastMine;

        // Verificar se o usuário tem estamina suficiente
        if (timePassed < 600000 && user.stamina <= 0) {
            // Estamina não recarregada após 10 minutos (600000ms)
            const timeLeft = 600000 - timePassed;
            const minutesLeft = Math.ceil(timeLeft / 60000); // converter de ms para minutos
            return interaction.reply(`Sua estamina está esgotada. Você precisa esperar **${minutesLeft} minutos** para minerar novamente.`);
        }

        // Se passaram 10 minutos, recarregar a estamina
        if (timePassed >= 600000) {
            user.stamina = 10;
            user.lastMine = currentTime;
        }

        // Verificar se há estamina suficiente para minerar
        if (user.stamina <= 0) {
            return interaction.reply('Você não tem estamina suficiente para minerar! Aguarde um momento para recarregar.');
        }

        // Atualizar inventário
        user.inventory[mined] = (user.inventory[mined] || 0) + quantity;
        user.stamina -= 1; // Usar 1 ponto de estamina
        data[userId] = user;

        // Salvar os dados atualizados
        fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));

        // Criar embed personalizada para resposta
        const embed = new EmbedBuilder()
            .setColor('#0088cc') // Cor azul para a mineração
            .setTitle('Mineração realizada com sucesso!')
            .setDescription(`Você minerou **${quantity}x ${mined}**!`)
            .addFields(
                { name: 'Estamina restante', value: `**${user.stamina}** pontos`, inline: true },
                { name: 'Novo inventário', value: `**${mined}**: ${user.inventory[mined]}`, inline: true },
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
