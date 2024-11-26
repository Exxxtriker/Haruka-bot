const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../../utils/datagame.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forge')
        .setDescription('Forje novos equipamentos usando minerais!')
        .addStringOption((option) => option
            .setName('equipamento')
            .setDescription('Equipamento que deseja forjar')
            .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const equipamento = interaction.options.getString('equipamento');

        const recipes = {
            espada: { madeira: 2, diamante: 3 },
            picareta: { madeira: 3, diamante: 5 },
        };

        // Verificar se o equipamento é válido
        if (!recipes[equipamento]) {
            return interaction.reply(
                'Equipamento inválido! Os equipamentos disponíveis são: espada e picareta.',
            );
        }

        // Carregar os dados do arquivo JSON
        let data;
        try {
            data = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
        } catch (error) {
            console.error('Erro ao carregar o arquivo JSON:', error);
            return interaction.reply('Erro ao carregar os dados do jogador. Tente novamente mais tarde.');
        }

        // Obter os dados do usuário ou criar padrão
        const user = data[userId] || { inventory: {} };
        const recipe = recipes[equipamento];

        // Verificar se o usuário tem os materiais necessários
        const missingMaterials = [];
        for (const [material, required] of Object.entries(recipe)) {
            if ((user.inventory[material] || 0) < required) {
                missingMaterials.push(`${material} (${required} necessário)`);
            }
        }

        if (missingMaterials.length > 0) {
            return interaction.reply(
                `Você não tem materiais suficientes para forjar uma ${equipamento}! Faltando: ${missingMaterials.join(', ')}`,
            );
        }

        // Atualizar inventário após forjar
        for (const [material, required] of Object.entries(recipe)) {
            user.inventory[material] -= required;
        }
        user.inventory[equipamento] = (user.inventory[equipamento] || 0) + 1;
        data[userId] = user;

        // Salvar os dados atualizados
        try {
            fs.writeFileSync(itemsPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Erro ao salvar os dados no arquivo:', error);
            return interaction.reply('Erro ao salvar os dados. Tente novamente mais tarde.');
        }

        // Criar uma embed personalizada para a resposta
        const embed = new EmbedBuilder()
            .setColor('#FFD700') // Cor verde para sucesso
            .setTitle(`Forjamento de ${equipamento} realizado com sucesso!`)
            .setDescription(`Você forjou uma **${equipamento}**!`)
            .addFields(
                {
                    name: 'Materiais usados',
                    value: Object.entries(recipe)
                        .map(([material, amount]) => `- ${material}: ${amount}x`)
                        .join('\n'),
                },
                { name: 'Novo equipamento no inventário', value: `**${equipamento}**: ${user.inventory[equipamento]}` },
                {
                    name: 'Materiais restantes no inventário',
                    value: Object.keys(recipe)
                        .map(
                            (material) => `${material.charAt(0).toUpperCase() + material.slice(1)}: ${
                                user.inventory[material] || 0
                            }`,
                        )
                        .join('\n'),
                },
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        // Responder com a embed
        await interaction.reply({ embeds: [embed] });
    },
};
