setup.getAbilityModifier = (score) => Math.floor((score - 10) / 2);

setup.getPlayerAbilityModifier = (stat) => {
  const score = State.variables.player.stats[stat];
  return setup.getAbilityModifier(score);
};

macros.getAbilityModifierStringForPlayer = {
  /* eslint-disable-next-line */
    handler(place, macroName, params, parser) {
    const modifier = setup.getPlayerAbilityModifier(params[0]);
    const sign = modifier >= 0 ? '+' : '';

    new Wikifier(place, sign + modifier);
  },
  init() { },
};
