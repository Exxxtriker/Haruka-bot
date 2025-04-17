const { Events } = require('discord.js');
const embed = require('./embeds/welcomeBed');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            // if (member.user.bot) return;

            const roleId = '1100053777907712101';

            // Buscar o cargo corretamente
            const memberRole = member.guild.roles.cache.get(roleId) || await member.guild.roles.fetch(roleId).catch(() => null);
            if (!memberRole) {
                console.error(`Cargo com ID ${roleId} não encontrado.`);
                return;
            }

            // Aqui usamos o objeto do cargo, não apenas o ID
            await member.roles.add(memberRole);

            const channelId = '1100048390546542623';
            const channel = member.guild.channels.cache.get(channelId);
            if (!channel) {
                console.error(`Canal com ID ${channelId} não encontrado.`);
                return;
            }

            await channel.send({ embeds: [embed(member)] });
        } catch (error) {
            console.error('Erro ao processar evento GuildMemberAdd:', error);
        }
    },
};
