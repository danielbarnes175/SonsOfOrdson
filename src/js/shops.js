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
    const {
      chemicalImbalance,
      greenRaven,
      linenDreams,
    } = State.variables.shopRelations;

    if (chemicalImbalance.currentProgress < chemicalImbalance.maxProgress) {
      chemicalImbalance.currentProgress++;
    }
    if (linenDreams.currentProgress > 0) {
      linenDreams.currentProgress--;
    }
    if (greenRaven.currentProgress > 0) {
      greenRaven.currentProgress--;
    }

    new Wikifier(place, 'You have received 5 gold as payment for your shift.');
    State.variables.player.gold += 5;
  },
  init() { },
};

macros.workForGreenRaven = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const {
      chemicalImbalance,
      greenRaven,
      linenDreams,
    } = State.variables.shopRelations;

    if (greenRaven.currentProgress < greenRaven.maxProgress) {
      greenRaven.currentProgress++;
    }
    if (chemicalImbalance.currentProgress > 0) {
      chemicalImbalance.currentProgress--;
    }
    if (linenDreams.currentProgress > 0) {
      linenDreams.currentProgress--;
    }

    new Wikifier(place, 'You have received 5 gold as payment for your shift.\n');
    State.variables.player.gold += 5;
  },
  init() { },
};

macros.workForLinenDreams = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const {
      chemicalImbalance,
      greenRaven,
      linenDreams,
    } = State.variables.shopRelations;

    if (linenDreams.currentProgress < linenDreams.maxProgress) {
      linenDreams.currentProgress++;
    }
    if (chemicalImbalance.currentProgress > 0) {
      chemicalImbalance.currentProgress--;
    }
    if (greenRaven.currentProgress > 0) {
      greenRaven.currentProgress--;
    }

    new Wikifier(place, 'You have received 5 gold as payment for your shift.');
    State.variables.player.gold += 5;
  },
  init() { },
};
