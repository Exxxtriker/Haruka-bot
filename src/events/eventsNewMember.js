const { Events } = require('discord.js');
const embed = require('./embeds/welcomeBed'); // Certifique-se de que este arquivo exporta corretamente um embed

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            // Ignorar bots
            if (member.user.bot) return;

            // Buscar o papel
            const memberRole = member.guild.roles.cache.find((role) => role.id === '1100053777907712101');

            // Adicionar o papel ao novo membro
            await member.roles.add(memberRole);

            // Buscar o canal de boas-vindas
            const channel = member.guild.channels.cache.get('1100048390546542623');
            if (!channel) {
                console.error('Canal com ID 1100048390546542623 não encontrado.');
                return;
            }

            // Enviar mensagem de boas-vindas
            await channel.send({ embeds: [embed(member)] });
        } catch (error) {
            console.error('Erro ao processar evento GuildMemberAdd:', error);
        }
    },
};
