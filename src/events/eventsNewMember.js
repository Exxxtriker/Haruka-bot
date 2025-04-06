const { Events } = require('discord.js');
const embed = require('./embeds/welcomeBed'); // Certifique-se de que este arquivo exporta corretamente um embed

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            // Ignorar bots
            if (member.user.bot) return;

            // ID do cargo a ser atribuído
            const roleId = '1100053777907712101';

            // Verificar se o cargo existe
            const memberRole = member.guild.roles.cache.get(roleId) || await member.guild.roles.fetch(roleId).catch(() => null);

            // Adicionar o cargo ao novo membro
            await member.roles.add(roleId);
            console.log(`Cargo ${memberRole.name} adicionado ao membro ${member.user.tag}`);

            // Buscar o canal de boas-vindas
            const channelId = '1100048390546542623';
            const channel = member.guild.channels.cache.get(channelId);
            if (!channel) {
                console.error(`Canal com ID ${channelId} não encontrado.`);
                return;
            }

            // Enviar mensagem de boas-vindas
            await channel.send({ embeds: [embed(member)] });
        } catch (error) {
            console.error('Erro ao processar evento GuildMemberAdd:', error);
        }
    },
};
