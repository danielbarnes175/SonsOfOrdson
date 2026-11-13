setup.registerDefinitions('enemies', {
  goblin: {
    name: 'Goblin',
    maxHealth: 10,
    stats: {
      str: 8,
      dex: 8,
      con: 8,
      int: 8,
      wis: 8,
      cha: 8,
    },
    armorClass: 10,
    attackBonus: 1,
    damage: '1d3+1',
    attackDescriptions: [
      'The Goblin attacks you!',
      'The Goblin attacks you with a dagger!',
      'The Goblin attacks you with a fist!',
    ],
    guildProgress: 1,
    rewards: {
      gold: {
        min: 10,
        max: 29,
      },
      exp: {
        min: 50,
        max: 99,
      },
    },
  },
});
