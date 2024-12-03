/* eslint-disable no-use-before-define */
// datacombat.js

function criarInimigo(nome, hpMin, hpMax, ataqueMin, ataqueMax, defesaMin, defesaMax) {
    return {
        nome,
        hp: getRandomNumber(hpMin, hpMax),
        ataque: getRandomNumber(ataqueMin, ataqueMax),
        defesa: getRandomNumber(defesaMin, defesaMax),
    };
}

function gerarInimigos() {
    return [
        criarInimigo('Goblin Selvagem', 80, 120, 25, 45, 5, 20),
        criarInimigo('Ladrão', 100, 150, 35, 55, 10, 20),
        criarInimigo('Elfo', 120, 180, 35, 65, 15, 25),
        criarInimigo('Dragão de Fogo', 200, 300, 35, 65, 20, 30),
        criarInimigo('Lorde das Sombras', 250, 350, 30, 65, 25, 35),
        criarInimigo('Titanos', 300, 450, 35, 65, 30, 40),
        criarInimigo('CLThanos', 400, 600, 40, 75, 35, 50),
    ];
}

function calcularVidaInicial(benção) {
    const vidaBase = 120;
    if (benção === 'fraca') return Math.floor(vidaBase * 0.9);
    if (benção === 'forte') return Math.floor(vidaBase * 1.2);
    return vidaBase;
}

function calcularDefesaInicial(benção) {
    const defesaBase = 20;
    if (benção === 'fraca') return Math.floor(defesaBase * 0.8);
    if (benção === 'forte') return Math.floor(defesaBase * 1.2);
    return defesaBase;
}

function calcularDano(userInventory, benção) {
    let danoBaseMin = 0;
    let danoBaseMax = 0;
    if (userInventory['Espada de diamante'] > 0) {
        danoBaseMin = 25;
        danoBaseMax = 95;
    } else if (userInventory['Espada de ferro'] > 0) {
        danoBaseMin = 15;
        danoBaseMax = 75;
    }

    const dano = getRandomNumber(danoBaseMin, danoBaseMax);

    if (benção === 'fraca') return Math.floor(dano * 0.8);
    if (benção === 'forte') return Math.floor(dano * 1.7);
    return dano;
}

function getBenção() {
    const benções = ['fraca', 'média', 'forte'];
    return benções[Math.floor(Math.random() * benções.length)];
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ganharLoot(userData) {
    const itens = ['Diamante', 'Ouro', 'Ferro', 'Pedra', 'Chave [NULL]', 'Espada de ferro'];
    const itemChances = {
        Diamante: 5,
        Ouro: 20,
        Ferro: 30,
        Pedra: 45,
        'Chave [NULL]': 1,
        'Espada de ferro': 10,
    };

    function selectItem() {
        const randomNum = Math.random() * 100;
        let cumulativeChance = 0;

        for (const item of itens) {
            cumulativeChance += itemChances[item];
            if (randomNum < cumulativeChance) {
                return item;
            }
        }
    }

    const itemAleatorio = selectItem();
    const quantity = Math.floor(Math.random() * 5) + 1;
    const coins = Math.floor(Math.random() * 30) + 20;

    if (!userData.inventory[itemAleatorio]) {
        userData.inventory[itemAleatorio] = 0;
    }
    userData.inventory[itemAleatorio] += quantity;

    return { item: itemAleatorio, quantity, coins };
}

module.exports = {
    gerarInimigos,
    calcularVidaInicial,
    calcularDefesaInicial,
    calcularDano,
    getBenção,
    getRandomNumber,
    ganharLoot,
};
