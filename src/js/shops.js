State.variables.shopRelations = {
  chemicalImbalance: {
    currentProgress: 0,
    maxProgress: 100,
    isPlayerHired: false,
  },
  greenRaven: {
    currentProgress: 0,
    maxProgress: 100,
    isPlayerHired: false,
  },
  linenDreams: {
    currentProgress: 0,
    maxProgress: 100,
    isPlayerHired: false,
  },
};

State.variables.shopInventories = {};

macros.workForChemicalImbalance = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    if (State.variables.shopRelations.chemicalImbalance.currentProgress < State.variables.shopRelations.chemicalImbalance.maxProgress) { State.variables.shopRelations.chemicalImbalance.currentProgress++; }
    if (State.variables.shopRelations.linenDreams.currentProgress > 0) { State.variables.shopRelations.linenDreams.currentProgress--; }
    if (State.variables.shopRelations.greenRaven.currentProgress > 0) { State.variables.shopRelations.greenRaven.currentProgress--; }

    new Wikifier(place, 'You have received 5 gold as payment for your shift.');
    State.variables.player.gold += 5;
  },
  init() { },
};

macros.workForGreenRaven = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    if (State.variables.shopRelations.greenRaven.currentProgress < State.variables.shopRelations.greenRaven.maxProgress) { State.variables.shopRelations.greenRaven.currentProgress++; }
    if (State.variables.shopRelations.chemicalImbalance.currentProgress > 0) { State.variables.shopRelations.chemicalImbalance.currentProgress--; }
    if (State.variables.shopRelations.linenDreams.currentProgress > 0) { State.variables.shopRelations.linenDreams.currentProgress--; }

    new Wikifier(place, 'You have received 5 gold as payment for your shift.\n');
    State.variables.player.gold += 5;
  },
  init() { },
};

macros.workForLinenDreams = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    if (State.variables.shopRelations.linenDreams.currentProgress < State.variables.shopRelations.linenDreams.maxProgress) { State.variables.shopRelations.linenDreams.currentProgress++; }
    if (State.variables.shopRelations.chemicalImbalance.currentProgress > 0) { State.variables.shopRelations.chemicalImbalance.currentProgress--; }
    if (State.variables.shopRelations.greenRaven.currentProgress > 0) { State.variables.shopRelations.greenRaven.currentProgress--; }

    new Wikifier(place, 'You have received 5 gold as payment for your shift.');
    State.variables.player.gold += 5;
  },
  init() { },
};
