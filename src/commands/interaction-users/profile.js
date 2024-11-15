const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment'); // Instale com `npm install moment`

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Exibe informações de um usuário.')
        .addUserOption(option =>
            option.setName('usuário')
                .setDescription('Selecione o usuário')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('usuário') || interaction.user; // Usuário selecionado ou autor do comando
        const member = interaction.guild.members.cache.get(user.id); // Obtém o membro no servidor

        // Formatações de datas usando Moment.js
        const accountCreationDate = moment(user.createdAt).format('DD/MM/YYYY HH:mm:ss');
        const serverJoinDate = moment(member.joinedAt).format('DD/MM/YYYY HH:mm:ss');

        // Obter o avatar do usuário, animado se for GIF
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

        // Embed de informações
        const embed = new EmbedBuilder()
            .setColor(0x8B0000) // Cor do embed
            .setTitle(`Informações de ${user.username}`)
            .setThumbnail(avatarUrl) // Avatar do usuário (dinâmico)
            .addFields(
                { name: 'Nome de Usuário', value: `${user.tag}`, inline: true },
                { name: 'ID', value: `${user.id}`, inline: true },
                { name: 'Conta Criada em', value: `${accountCreationDate}`, inline: false },
                { name: 'Entrou no Servidor em', value: `${serverJoinDate}`, inline: false },
            )
            .setFooter({
                text: `Solicitado por ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        // Envia o embed
        await interaction.reply({ embeds: [embed] });
    },
};
