setup.registerDefinitions('quests', {
  'A certain undergarment': {
    title: 'A Certain Undergarment',
    description: "Apparently the barkeep wants a specific piece of clothing, but he can't quite get it right now...",
    hint: 'Word on the street is that the barkeep over at Chemical Imbalance needs help with something.',
    objectives: [
      {
        id: 'collectOrder',
        description: 'Pick up the barkeep\'s custom order from the Silver Patchwork.',
      },
      {
        id: 'returnOrder',
        description: 'Take the sealed package back to the barkeep at Chemical Imbalance.',
      },
    ],
    rewards: {
      gold: 10,
      exp: 20,
    },
  },
  'Thieves Guild Entrance Exam': {
    title: 'Thieves Guild Entrance Exam',
    description: 'Prove your worth to the Thieves\' Guild by stealing something valuable from the Salt Fort.',
    hint: 'There is a thieves\' guild somewhere in the city. If only you knew how to find them.',
    objectives: [
      {
        id: 'investigateSaltFort',
        description: 'Explore the Salt Fort and identify something valuable to steal.',
      },
      {
        id: 'stealArtifact',
        description: 'Sneak into the Salt Fort and steal the artifact.',
      },
      {
        id: 'returnArtifact',
        description: 'Bring the artifact back to the Thieves\' Guild.',
      },
    ],
    rewards: {
      exp: 20,
    },
  },
  'The Fourth Bank of Ordson': {
    title: 'The Fourth Bank of Ordson',
    description: 'Discover why terrible things keep happening to the banks of Ordson.',
    hint: 'Was it insurance fraud, poor ownership, or a curse?',
    objectives: [
      {
        id: 'investigateBanks',
        description: 'Investigate what happened to the previous banks of Ordson. (WIP)',
      },
    ],
    rewards: {
      gold: 1000,
      exp: 500,
    },
  },
  'test quest': {
    title: 'Test Quest',
    description: 'A quest used to verify the quest framework.',
    hint: 'A test quest?! Surely this will be removed in the official release...',
    objectives: [
      {
        id: 'finishTest',
        description: 'Complete the test objective.',
      },
    ],
    rewards: {
      gold: 10,
      exp: 20,
      items: [
        {
          definitionId: 'healthPotion',
          quantity: 2,
        },
      ],
    },
  },
});

setup.questStatuses = setup.deepFreeze({
  active: 'active',
  available: 'available',
  completed: 'completed',
  failed: 'failed',
  hidden: 'hidden',
});

setup.questRumors = setup.deepFreeze([
  {
    message: 'blah',
    quest: 'test quest',
  },
]);

setup.createQuestState = () => ({
  status: setup.questStatuses.hidden,
  objectiveIndex: 0,
  rewardClaimed: false,
});

State.variables.quests = {
  questLog: {},
};

Object.keys(setup.data.quests).forEach((questId) => {
  State.variables.quests.questLog[questId] = setup.createQuestState();
});

setup.getQuestState = (questId) => State.variables.quests.questLog[questId] || null;

setup.getQuestObjective = (questId) => {
  const definition = setup.getDefinition('quests', questId);
  const quest = setup.getQuestState(questId);
  if (!definition || !quest || quest.status !== setup.questStatuses.active) return null;
  return definition.objectives[quest.objectiveIndex] || null;
};

setup.getQuestsByStatus = (status) => Object.keys(setup.data.quests)
  .filter((questId) => setup.getQuestState(questId).status === status);

setup.isQuestStatus = (questId, status) => {
  const quest = setup.getQuestState(questId);
  return Boolean(quest && quest.status === status);
};

setup.isQuestObjective = (questId, objectiveId) => {
  const objective = setup.getQuestObjective(questId);
  return Boolean(objective && objective.id === objectiveId);
};

setup.discoverQuest = (questId) => {
  const definition = setup.getDefinition('quests', questId);
  const quest = setup.getQuestState(questId);
  if (!definition || !quest) return { success: false, reason: `Unknown quest: ${questId}` };
  if (quest.status !== setup.questStatuses.hidden) {
    return { success: false, reason: `${definition.title} has already been discovered.` };
  }

  quest.status = setup.questStatuses.available;
  return { success: true, definition, quest };
};

setup.startQuest = (questId) => {
  const definition = setup.getDefinition('quests', questId);
  const quest = setup.getQuestState(questId);
  if (!definition || !quest) return { success: false, reason: `Unknown quest: ${questId}` };
  if (![setup.questStatuses.hidden, setup.questStatuses.available].includes(quest.status)) {
    return { success: false, reason: `${definition.title} cannot be started right now.` };
  }
  if (definition.objectives.length === 0) {
    return { success: false, reason: `${definition.title} has no objectives.` };
  }

  quest.status = setup.questStatuses.active;
  quest.objectiveIndex = 0;
  quest.rewardClaimed = false;
  return {
    success: true,
    definition,
    objective: definition.objectives[0],
    quest,
  };
};

setup.completeQuest = (questId) => {
  const definition = setup.getDefinition('quests', questId);
  const quest = setup.getQuestState(questId);
  if (!definition || !quest) return { success: false, reason: `Unknown quest: ${questId}` };
  if (quest.status !== setup.questStatuses.active) {
    return { success: false, reason: `${definition.title} is not active.` };
  }

  quest.status = setup.questStatuses.completed;
  quest.objectiveIndex = definition.objectives.length;
  return { success: true, definition, quest };
};

setup.advanceQuest = (questId, expectedObjectiveId) => {
  const definition = setup.getDefinition('quests', questId);
  const quest = setup.getQuestState(questId);
  if (!definition || !quest) return { success: false, reason: `Unknown quest: ${questId}` };
  if (quest.status !== setup.questStatuses.active) {
    return { success: false, reason: `${definition.title} is not active.` };
  }

  const objective = definition.objectives[quest.objectiveIndex];
  if (expectedObjectiveId && objective.id !== expectedObjectiveId) {
    return { success: false, reason: `${definition.title} is on a different objective.` };
  }
  if (quest.objectiveIndex >= definition.objectives.length - 1) {
    return setup.completeQuest(questId);
  }

  quest.objectiveIndex += 1;
  return {
    success: true,
    definition,
    objective: definition.objectives[quest.objectiveIndex],
    quest,
  };
};

setup.setQuestObjective = (questId, objectiveId) => {
  const definition = setup.getDefinition('quests', questId);
  const quest = setup.getQuestState(questId);
  if (!definition || !quest) return { success: false, reason: `Unknown quest: ${questId}` };
  if (quest.status !== setup.questStatuses.active) {
    return { success: false, reason: `${definition.title} is not active.` };
  }

  const isRequestedObjective = (objective) => objective.id === objectiveId;
  const objectiveIndex = definition.objectives.findIndex(isRequestedObjective);
  if (objectiveIndex === -1) {
    return { success: false, reason: `Unknown objective: ${objectiveId}` };
  }
  quest.objectiveIndex = objectiveIndex;
  return {
    success: true,
    definition,
    objective: definition.objectives[objectiveIndex],
    quest,
  };
};

setup.failQuest = (questId) => {
  const definition = setup.getDefinition('quests', questId);
  const quest = setup.getQuestState(questId);
  if (!definition || !quest) return { success: false, reason: `Unknown quest: ${questId}` };
  if (quest.status !== setup.questStatuses.active) {
    return { success: false, reason: `${definition.title} is not active.` };
  }

  quest.status = setup.questStatuses.failed;
  return { success: true, definition, quest };
};

setup.claimQuestRewards = (questId) => {
  const definition = setup.getDefinition('quests', questId);
  const quest = setup.getQuestState(questId);
  if (!definition || !quest) return { success: false, reason: `Unknown quest: ${questId}` };
  if (quest.status !== setup.questStatuses.completed) {
    return { success: false, reason: `${definition.title} is not complete.` };
  }
  if (quest.rewardClaimed) {
    return { success: false, reason: `${definition.title}'s reward has already been claimed.` };
  }

  const rewards = definition.rewards || {};
  const gold = rewards.gold || 0;
  const exp = rewards.exp || 0;
  const items = rewards.items || [];
  const invalidItem = items.find((item) => (
    !setup.getDefinition('items', item.definitionId)
    || !Number.isInteger(item.quantity || 1)
    || (item.quantity || 1) < 1
  ));
  if (invalidItem) {
    return { success: false, reason: `${definition.title} has an invalid item reward.` };
  }

  State.variables.player.gold += gold;
  State.variables.player.exp += exp;
  items.forEach((item) => setup.addItemToInventory(item.definitionId, item.quantity || 1));
  quest.rewardClaimed = true;
  return {
    success: true,
    exp,
    gold,
    items,
  };
};

setup.renderQuestMacroError = (place, result) => {
  if (!result.success) new Wikifier(place, result.reason);
};

macros.discoverQuest = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.renderQuestMacroError(place, setup.discoverQuest(params[0]));
  },
  init() { },
};

macros.startQuest = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.renderQuestMacroError(place, setup.startQuest(params[0]));
  },
  init() { },
};

macros.advanceQuest = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.renderQuestMacroError(place, setup.advanceQuest(params[0], params[1]));
  },
  init() { },
};

macros.setQuestObjective = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.renderQuestMacroError(place, setup.setQuestObjective(params[0], params[1]));
  },
  init() { },
};

macros.completeQuest = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.renderQuestMacroError(place, setup.completeQuest(params[0]));
  },
  init() { },
};

macros.failQuest = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.renderQuestMacroError(place, setup.failQuest(params[0]));
  },
  init() { },
};

macros.receiveQuestReward = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const result = setup.claimQuestRewards(params[0]);
    if (!result.success) {
      new Wikifier(place, result.reason);
      return;
    }

    new Wikifier(place, 'You received...\n');
    if (result.gold > 0) new Wikifier(place, `''Gold:'' ${result.gold}\n`);
    if (result.exp > 0) new Wikifier(place, `''Exp:'' ${result.exp}\n`);
    result.items.forEach((item) => {
      const itemDefinition = setup.getDefinition('items', item.definitionId);
      new Wikifier(place, `''${itemDefinition.name}:'' ${item.quantity || 1}\n`);
    });
  },
  init() { },
};
