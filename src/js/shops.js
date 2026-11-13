setup.registerDefinitions('shops', {
  chemicalImbalance: {
    maxProgress: 100,
    shiftPay: 5,
    rivals: ['linenDreams', 'greenRaven'],
  },
  greenRaven: {
    maxProgress: 100,
    shiftPay: 5,
    rivals: ['chemicalImbalance', 'linenDreams'],
  },
  linenDreams: {
    maxProgress: 100,
    shiftPay: 5,
    rivals: ['chemicalImbalance', 'greenRaven'],
  },
});

State.variables.shopRelations = {};
Object.keys(setup.data.shops).forEach((shopId) => {
  State.variables.shopRelations[shopId] = {
    currentProgress: 0,
    isPlayerHired: false,
  };
});

State.variables.shopInventories = {};

setup.workForShop = (shopId) => {
  const definition = setup.getDefinition('shops', shopId);
  const relation = State.variables.shopRelations[shopId];

  if (relation.currentProgress < definition.maxProgress) {
    relation.currentProgress += 1;
  }
  definition.rivals.forEach((rivalId) => {
    const rival = State.variables.shopRelations[rivalId];
    if (rival.currentProgress > 0) rival.currentProgress -= 1;
  });

  State.variables.player.gold += definition.shiftPay;
  return definition.shiftPay;
};

macros.workForChemicalImbalance = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const pay = setup.workForShop('chemicalImbalance');
    new Wikifier(place, `You have received ${pay} gold as payment for your shift.`);
  },
  init() { },
};

macros.workForGreenRaven = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const pay = setup.workForShop('greenRaven');
    new Wikifier(place, `You have received ${pay} gold as payment for your shift.\n`);
  },
  init() { },
};

macros.workForLinenDreams = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const pay = setup.workForShop('linenDreams');
    new Wikifier(place, `You have received ${pay} gold as payment for your shift.`);
  },
  init() { },
};
