const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

require('./src/handlers/eventsHandler')(client);
require('./src/handlers/commandsHandler')(client);
require('./src/handlers/modalHadler')(client);

client.login(token);
