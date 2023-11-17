const { ActivityType, Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(bot) {
        await bot.guilds.fetch();

        let isAlternate = false;
        let interval;

        // Função para alternar entre os estados de atividade
        function toggleActivity() {
            const guildCount = bot.guilds.cache.size;
            const userCount = bot.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

            if (isAlternate) {
                bot.user.setActivity(`${userCount} Users | ${guildCount} Servers🔥`, { type: ActivityType.Listening });
            } else {
                bot.user.setActivity('/help 🎸', { type: ActivityType.Listening });
            }

            isAlternate = !isAlternate;
        }
        interval = setInterval(toggleActivity, 10000); // Timer

        await bot.user.setStatus('idle');

        console.log(`✅ Login successfully on ${bot.user.username}#${bot.user.discriminator} - Estou em ${bot.guilds.cache.size} servidores`);
    },
};
