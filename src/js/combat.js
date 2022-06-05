State.variables.currentEncounter = {
  turn: -1, // No encounter
};

macros.setupEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const enemies = [];
    const enemyActions = [];
    for (let i = 1; i < params.length; i++) {
      const enemy = params[i];
      enemy.id = i;
      enemies.push(enemy);
      enemyActions.push(`A ${params[i].name} appears before you.\n`);
    }

    State.variables.currentEncounter = {
      enemies,
      enemyActions,
      turn: 0,
      playerActions: getPlayerActions(),
      playerAction: 'You wait with anticipation.',
      encounterEnded: false,
    };
  },
  init() { },
};

macros.progressEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    processPlayerAction(params[0], params[1]);
    processEnemyActions();

    if (isEncounterOver()) {
      processEncounterOver();
    }

    State.variables.currentEncounter.turn += 1;
  },
  init() { },
};

macros.endEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    State.variables.currentEncounter = {};
  },
  init() { },
};

let getPlayerActions = () => [
  State.variables.weapons.Dagger,
  State.variables.weapons.Fist,
];

let isEncounterOver = () => {
  // Check if player has died
  if (State.variables.player.health <= 0) {
    State.variables.currentEncounter.playerWonEncounter = false;
    return true;
  }

  // Check if any enemies are alive
  for (let i = 0; i < State.variables.currentEncounter.enemies.length; i++) {
    if (State.variables.currentEncounter.enemies[i].health > 0) {
      return false;
    }
  }

  State.variables.currentEncounter.playerWonEncounter = true;
  return true;
};

let processEncounterOver = () => {
  State.variables.currentEncounter.encounterEnded = true;
};

let processPlayerAction = (playerAction, playerTargetIndex) => {
  const diceRoll = dice('1d20');
  const success = diceRoll >= 6;
  const damage = dice(playerAction.damage);
  if (success) {
    const playerSuccessFlavor = playerAction.flavor.success;
    const index = Math.floor(Math.random() * playerSuccessFlavor.length);

    State.variables.currentEncounter.playerAction = `${playerSuccessFlavor[index]} ${damage} damage.`;
    State.variables.currentEncounter.enemies[playerTargetIndex].health -= damage;
  } else {
    const playerFailureFlavor = playerAction.flavor.failure;
    const index = Math.floor(Math.random() * playerFailureFlavor.length);

    State.variables.currentEncounter.playerAction = playerFailureFlavor[index];
  }

  if (diceRoll === 1) {
    State.variables.currentEncounter.playerAction = playerAction.flavor.criticalFailure;
    State.variables.player.health -= Math.floor(damage / 2);
  } else if (diceRoll === 20) {
    State.variables.currentEncounter.playerAction = `${playerAction.flavor.criticalSuccess} ${damage * 2} damage.`;
    State.variables.currentEncounter.enemies[playerTargetIndex].health -= damage * 2;
  }
};

let processEnemyActions = () => {
  State.variables.currentEncounter.enemyActions = [];
  for (let i = 0; i < State.variables.currentEncounter.enemies.length; i++) {
    const actions = [
      `The ${State.variables.currentEncounter.enemies[i].name} attacks you!`,
      `The ${State.variables.currentEncounter.enemies[i].name} attacks you with a dagger!`,
      `The ${State.variables.currentEncounter.enemies[i].name} attacks you with a fist!`,
    ];
    const diceRoll = dice('1d20');
    const success = diceRoll >= 14;
    const randomAction = Math.floor(Math.random() * actions.length);
    const damage = dice('1d3');

    if (success) {
      State.variables.currentEncounter.enemyActions.push(`${actions[randomAction]} You take ${damage} damage.`);
      State.variables.player.health -= damage;
    } else {
      State.variables.currentEncounter.enemyActions.push(`${actions[randomAction]} It's a miss!`);
    }
  }
};
