State.variables.player = {
  name: 'Bob',
  age: '20',
  level: 1,
  gold: 50,
  exp: 0,
  health: 30,
  maxHealth: 30,
  mana: 30,
  maxMana: 30,
  stats: {
    str: 8,
    dex: 8,
    con: 8,
    int: 8,
    wis: 8,
    cha: 8,
  },
  location: 'Unknown',
  inventory: {
    currentlyEquipped: {
      head: {
        name: 'None',
      },
      chest: {
        name: 'None',
      },
      legs: {
        name: 'None',
      },
      feet: {
        name: 'None',
      },
      weapons: {
        name: 'None',
      },
    },
    backpack: {
      head: [],
      chest: [],
      legs: [],
      feet: [],
      weapons: [],
      general: [],
    },
  },
  intoxication: 0,
};
