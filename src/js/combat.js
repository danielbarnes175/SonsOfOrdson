State.variables.currentEncounter = {
  turn: -1, // No encounter
};

setup.getRandomEnemies = (maxEnemyCount) => {
  const enemies = [];

  const numberOfEnemies = Math.floor(Math.random() * maxEnemyCount) + 1;
  for (let i = 0; i < numberOfEnemies; i++) {
    const enemyType = Math.floor(Math.random() * Object.keys(State.variables.enemies).length);
    const enemyKey = Object.keys(State.variables.enemies)[enemyType];
    const randomEnemy = State.variables.enemies[enemyKey];
    enemies.push(randomEnemy);
  }

  return enemies;
};

macros.setupEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const enemies = [];
    const enemyActions = [];
    State.variables.player.locationBeforeEncounter = State.variables.player.location;
    for (let i = 0; i < params[1].length; i++) {
      const enemy = params[1][i];
      enemy.id = i;
      enemies.push(enemy);
      enemyActions.push(`A ${params[1][i].name} appears before you.\n`);
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

macros.processEncounterWon = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const gold = Math.floor(Math.random() * 20) + 10;
    const exp = Math.floor(Math.random() * 50) + 50;

    State.variables.player.gold += gold;
    State.variables.player.exp += exp;

    new Wikifier(place, "You've received: \n");
    new Wikifier(place, `${gold} Gold\n`);
    new Wikifier(place, `${exp} Exp\n`);
  },
  init() { },
};

let getPlayerActions = () => [
  State.variables.weapons.dagger,
  State.variables.weapons.fist,
];

let isEncounterOver = () => {
  // Check if player has died
  if (State.variables.player.health <= 0) {
    State.variables.currentEncounter.playerWonEncounter = false;
    State.variables.player.health = 0;
    return true;
  }

  // Check if any enemies are alive
  const aliveEnemies = [];
  for (let i = 0; i < State.variables.currentEncounter.enemies.length; i++) {
    const currentEnemy = State.variables.currentEncounter.enemies[i];
    if (currentEnemy.health > 0) {
      aliveEnemies.push(currentEnemy);
    } else if (State.variables.guilds.adventurersGuild.isPlayerMemberOf) {
      State.variables.guilds.adventurersGuild.currentProgress += currentEnemy.guildProgress;
    }
  }

  if (aliveEnemies.length > 0) {
    State.variables.currentEncounter.enemies = aliveEnemies;
    return false;
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
      State.variables.currentEncounter.enemyActions.push(`${actions[randomAction]} You take ${damage} damage.\n`);
      State.variables.player.health -= damage;
    } else {
      State.variables.currentEncounter.enemyActions.push(`${actions[randomAction]} It's a miss!\n`);
    }
  }
};
