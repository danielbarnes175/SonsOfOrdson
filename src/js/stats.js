let abilityScoreModifiers = [
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
    10
]

macros.getAbilityModifierForPlayer =  {
    /* eslint-disable-next-line */
    handler(place, macroName, params, parser) {
      let stat = params[0];
      let baseValue = State.variables.player.stats[stat];

      // Calculate based off of items and other perks here.
      let computedValue = baseValue;
      let modifier = abilityScoreModifiers[computedValue - 1];
      let sign = (modifier >= 0) ? '+' : '';

      new Wikifier(place, sign + modifier);
    },
    init() { },
  };