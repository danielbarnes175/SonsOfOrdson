setup.playerDefaults = setup.deepFreeze({
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
      head: null,
      chest: null,
      legs: null,
      feet: null,
      weapons: null,
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
});

State.variables.player = clone(setup.playerDefaults);
