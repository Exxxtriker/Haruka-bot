const { Events } = require('discord.js');
const embed = require('./embeds/welcomeBed');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // if (member.user.bot) return;

        const roleId = '1100053777907712101';

        // Buscar o cargo corretamente
        const memberRole = member.guild.roles.cache.get(roleId) || await member.guild.roles.fetch(roleId).catch(() => null);

        await member.roles.add(memberRole);

        const channelId = '1100048390546542623';
        const channel = member.guild.channels.cache.get(channelId);

        await channel.send({ embeds: [embed(member)] });
    },
};
