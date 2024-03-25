module.exports = (member) => ({
    color: '000000',
    title: 'Seja bem vindo ao MotoClub',
    author: {
        name: 'Haruka',
        icon_url: 'https://cdn.discordapp.com/attachments/1084488222278688890/1092202988828893296/a.png',
    },
    description: `**<@${member.user.id}> \n **Por favor visite o canal** <#1100060121868030023>**`,
    thumbnail: {
        url: 'https://wallpaper-house.com/data/out/6/wallpaper2you_120727.jpg',
    },
    image: {
        url: 'https://wallpaper.dog/large/20488187.jpg',
    },
    fields: [
        {
            name: '**Fique á vontade em nossos canais de Entreterimento :**',
            value: '<#1170110185973502072> :heart_on_fire: \n <#1100066765637177456> :heart_on_fire:',
        },
        {
            name: '**Passe pela categoria 👻・Mini Games onde temos:**',
            value: '<#1140631807495258172> :game_die: \n <#1140631849023049800> :game_die: \n <#1140706806373552209> :game_die: \n <#1140717410257731764> :game_die: \n \n **Fique atento no canal** <#1100043571081531493> \n **Para receber as notificações das Lives!**',
        },
    ],
    timestamp: new Date().toISOString(),
    footer: {
        text: 'Todos os direitos reservados á Exxxtriker',
        icon_url: 'https://cdn.discordapp.com/attachments/1084488222278688890/1100868552203980810/73f39cb8-c234-451f-b7e3-e9d820a39681-profile_image-300x300.png',
    },
});
