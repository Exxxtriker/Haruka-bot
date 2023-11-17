const { Events } = require('discord.js');
const embed = require('./embeds/welcomeBed');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        if (member.user.bot === true) return;

        const memberRole = await member.guild.roles.cache.find((role) => role.id === '1100053777907712101');
        await member.roles.add(memberRole);

        const channel = await member.guild.channels.cache.get('1100048390546542623');
        await channel.send({ embeds: [embed(member)] });
    },
};
