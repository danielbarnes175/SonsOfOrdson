State.variables.abilityScoreModifiers = [
  -5,
  -4,
  -4,
  -3,
  -3,
  -2,
  -2,
  -1,
  -1,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
];

State.variables.getAbilityModifierForPlayer = (stat) => {
  const baseValue = State.variables.player.stats[stat];

  // Calculate based off of items and other perks here.
  const computedValue = baseValue;
  return State.variables.abilityScoreModifiers[computedValue - 1];
};

macros.getAbilityModifierStringForPlayer = {
  /* eslint-disable-next-line */
    handler(place, macroName, params, parser) {
    const stat = params[0];
    const baseValue = State.variables.player.stats[stat];

    // Calculate based off of items and other perks here.
    const computedValue = baseValue;
    const modifier = State.variables.abilityScoreModifiers[computedValue - 1];
    const sign = (modifier >= 0) ? '+' : '';

    new Wikifier(place, sign + modifier);
  },
  init() { },
};
