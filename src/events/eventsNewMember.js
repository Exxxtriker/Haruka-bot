const { Events } = require('discord.js');
const embed = require('./embeds/welcomeBed');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // if (member.user.bot) return;
        const roleId = '1100053777907712101';

        // Buscar o cargo corretamente
        const memberRole = member.guild.roles.cache.get(roleId) || await member.guild.roles.fetch(roleId).catch(() => null);

        if (!memberRole) {
            console.error(`Role with ID ${roleId} not found.`);
            return; // Não tenta adicionar o cargo se ele não for encontrado
        }

        await member.roles.add(memberRole).catch((err) => {
            console.error(`Failed to add role to member: ${err.message}`);
        });

        const channelId = '1100048390546542623';
        const channel = member.guild.channels.cache.get(channelId);

        if (!channel) {
            console.error(`Channel with ID ${channelId} not found.`);
            return; // Não tenta enviar mensagem se o canal não for encontrado
        }

        await channel.send({ embeds: [embed(member)] }).catch((err) => {
            console.error(`Failed to send welcome message: ${err.message}`);
        });
    },
};
