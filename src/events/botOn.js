const { ActivityType, Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(bot) {
        await bot.guilds.fetch();

        // Lista de atividades para alternar (sem timer)
        const activities = [
            {
                text: 'Are you afraid?',
                details: 'Competitive',
                type: ActivityType.Playing,
            },
            {
                text: '/help 🎸',
                details: 'Explore Commands',
                type: ActivityType.Playing,
            },
            {
                text: `${bot.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} Users | ${bot.guilds.cache.size} Servers🔥`,
                details: 'Active on Multiple Servers',
                type: ActivityType.Playing,
            },
        ];

        let currentIndex = 0; // Inicia o índice da rotação de atividades

        // Função para alternar entre as atividades
        function updateActivity() {
            const activity = activities[currentIndex];

            // Configuração do Rich Presence sem timer
            bot.user.setActivity(activity.text, {
                type: activity.type,
                details: activity.details,
            });

            // Incrementa o índice para a próxima atividade (faz rotação)
            currentIndex = (currentIndex + 1) % activities.length;
        }

        // Atualiza a atividade a cada 10 segundos
        setInterval(updateActivity, 10000); // A cada 10 segundos

        // Inicializa a primeira atividade imediatamente
        updateActivity();

        // Definir o status do bot
        await bot.user.setStatus('online');

        console.log(`✅ Login successfully on ${bot.user.username}#${bot.user.discriminator} - Estou em ${bot.guilds.cache.size} servidores`);
    },
};
