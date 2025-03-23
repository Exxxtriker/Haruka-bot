/* eslint-disable max-len */
module.exports = (member) => ({
    color: '000000',
    title: 'Seja bem vindo ao MotoClub',
    author: {
        name: 'Haruka',
        icon_url: 'https://media.discordapp.net/attachments/1310325661839392889/1312064166277808138/0ef715af51d62dadfa1feaaa625b025c.png?ex=675b9d3a&is=675a4bba&hm=5b253e7becc2b400f4a260e923a662beb1da7cb34df7c4c952e7468a14ad2744&=&format=webp&quality=lossless&width=397&height=397',
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
            // eslint-disable-next-line max-len
            value: '<#1353008903226396684> :game_die: \n <#1353015818585116753> :game_die: \n <#1140706806373552209> :game_die: \n <#1140717410257731764> :game_die: \n \n **Fique atento no canal** <#1100043571081531493> \n **Para receber as notificações das Lives!**',
        },
    ],
    timestamp: new Date().toISOString(),
    footer: {
        text: 'Todos os direitos reservados á Exxxtriker',
        // eslint-disable-next-line max-len
        icon_url: 'https://media.discordapp.net/attachments/1310325661839392889/1312064166277808138/0ef715af51d62dadfa1feaaa625b025c.png?ex=675b9d3a&is=675a4bba&hm=5b253e7becc2b400f4a260e923a662beb1da7cb34df7c4c952e7468a14ad2744&=&format=webp&quality=lossless&width=397&height=397',
    },
});
