setup.registerDefinitions('quests', {
  'A certain undergarment': {
    title: 'A Certain Undergarment',
    description: "Apparently the barkeep wants a specific piece of clothing, but he can't quite get it right now...",
    steps: [
      'Word on the street is that the barkeep over at Chemical Imbalance needs help with something',
      'The barkeep wants you to get a specific custom made piece of clothing. You should be able to pick it up at the Silver Patchwork.',
      'You spoke to the tailor at the Silver Patchwork, and they gave you the piece of clothing. You need to take it back to the barkeep',
      'Quest Complete',
    ],
    rewards: {
      gold: 10,
      exp: 20,
    },
  },
  'Thieves Guild Entrance Exam': {
    title: 'Thieves Guild Entrance Exam',
    description: 'The dude at the Thieve\'s Guild said that to join them, you\'d have to steal something valuable from the Salt Fort. Shouldn\'t be too difficult.',
    steps: [
      'There\'s a thieve\'s guild somewhere in the city. If only you knew how to find them.',
      'You first have to explore the Salt Fort, and figure out what\'s valuable to steal.',
      'Sneak into the Salt Fort and steal the artifact',
      'Bring the artifact back to the Thieve\'s Guild and hopefully they\'ll let you in.',
      'Quest Complete',
    ],
    rewards: {
      exp: 20,
    },
  },
  'The Fourth Bank of Ordson': {
    title: 'The Fourth Bank of Ordson',
    description: 'The previous banks all had something terrible happen to them? Why? Was it insurance fraud? Poor ownership? A curse? Get to the bottom of it.',
    steps: [
      'WIP - The previous banks all had something terrible happen to them? Why? Was it insurance fraud? Poor ownership? A curse? Get to the bottom of it.',
      'Quest Complete',
    ],
    rewards: {
      gold: 1000,
      exp: 500,
    },
  },
  'test quest': {
    title: 'Test quest',
    description: 'Test quest',
    steps: [
      'A test quest?! Surely this will be removed in the official release...',
      'Quest Complete',
    ],
    rewards: {
      gold: 10,
      exp: 20,
    },
  },
});

setup.questRumors = setup.deepFreeze([
  {
    message: 'blah',
    quest: 'test quest',
  },
]);

State.variables.quests = {
  questLog: {},
};

Object.keys(setup.data.quests).forEach((questId) => {
  State.variables.quests.questLog[questId] = {
    currentStep: 0,
    knownQuest: false,
    rewardClaimed: false,
  };
});

macros.receiveQuestReward = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const questId = params[0];
    const quest = State.variables.quests.questLog[questId];
    const definition = setup.getDefinition('quests', questId);

    if (quest.rewardClaimed) {
      new Wikifier(place, 'You have already received this quest reward.');
      return;
    }

    const gold = definition.rewards.gold || 0;
    const exp = definition.rewards.exp || 0;
    State.variables.player.gold += gold;
    State.variables.player.exp += exp;
    quest.rewardClaimed = true;

    new Wikifier(place, 'You received....\n');
    if (gold > 0) new Wikifier(place, `''Gold:'' ${gold}\n`);
    if (exp > 0) new Wikifier(place, `''Exp:'' ${exp}\n`);
  },
  init() { },
};
