State.variables.currentEncounter = {
    turn: -1, // No encounter
}

macros.setupEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    let enemies = [];
    let enemyActions = [];
    let player = params[0];
    for (let i = 0; i < params.length; i++) {
          if (i == 0) continue;

          params[i].id = i;
          enemies.push(params[i]);
          enemyActions.push(`A ${params[i].name} appears before you.\n`);
        }

    State.variables.currentEncounter = {
        enemies,
        enemyActions,
        turn: 0,
        playerActions: getPlayerActions(player),
        playerAction: 'You wait with anticipation.',
        encounterEnded: false,
    }
    console.log(JSON.stringify(State.variables.currentEncounter));
  },
  init() { },
}

macros.progressEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    processPlayerAction(params[0], params[1]);
    processEnemyActions();
    
    if (isEncounterOver()) {
        console.log('Encounter over');
        processEncounterOver();
    }

    State.variables.currentEncounter.turn += 1;
  },
  init() { },
}

macros.endEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    State.variables.currentEncounter = {};
  },
  init() { },
}

let getPlayerActions = (player) => {
    return [
        State.variables.weapons['Dagger'],
        State.variables.weapons['Fist'],
    ];
}

let isEncounterOver = () => {
    if (State.variables.player.health <= 0) {
        State.variables.currentEncounter.playerWonEncounter = false;
        return true;
    }

    // Check if any enemies are alive
    for (let i = 0; i < State.variables.currentEncounter.enemies.length; i++) {
        console.log(State.variables.currentEncounter.enemies[i].health);
        if (State.variables.currentEncounter.enemies[i].health > 0) {
            console.log('Enemy is alive');
            return false;
        }
    }
    console.log('Enemies are dead');

    State.variables.currentEncounter.playerWonEncounter = true;
    return true;
};

let processEncounterOver = () => {
    State.variables.currentEncounter.encounterEnded = true;
};

let processPlayerAction = (playerAction, playerTargetIndex) => {
    let diceRoll = dice('1d20');
    let success = diceRoll >= 6 ? true : false;
    let damage = dice(playerAction.damage);
    if (success) {
        State.variables.currentEncounter.playerAction = playerAction.flavor.success[Math.floor(Math.random() * playerAction.flavor.success.length)] + ` ${damage} damage.`;
        State.variables.currentEncounter.enemies[playerTargetIndex].health -= damage;
    } else {
        State.variables.currentEncounter.playerAction = playerAction.flavor.failure[Math.floor(Math.random() * playerAction.flavor.failure.length)];
    }

    if (diceRoll == 1) {
        State.variables.currentEncounter.playerAction = playerAction.flavor.criticalFailure;
        State.variables.player.health -= Math.floor(damage / 2);
    } else if (diceRoll == 20) {
        State.variables.currentEncounter.playerAction = playerAction.flavor.criticalSuccess + ` ${damage * 2} damage.`;
        State.variables.currentEncounter.enemies[playerTargetIndex].health -= damage * 2;
    }
}

let processEnemyActions = () => {
    let actions = [
        `The enemy attacks you!`,
        `The enemy attacks you with a dagger!`,
        `The enemy attacks you with a fist!`,
    ];

    State.variables.currentEncounter.enemyActions = [];
    for (let i = 0; i < State.variables.currentEncounter.enemies.length; i++) {
        let actions = [
            `The ${State.variables.currentEncounter.enemies[i].name} attacks you!`,
            `The ${State.variables.currentEncounter.enemies[i].name} attacks you with a dagger!`,
            `The ${State.variables.currentEncounter.enemies[i].name} attacks you with a fist!`,
        ];
        let diceRoll = dice('1d20');
        let success = diceRoll >= 14 ? true : false;
        let randomAction = Math.floor(Math.random() * actions.length);
        let damage = dice('1d3');

        if (success) {
            State.variables.currentEncounter.enemyActions.push(actions[randomAction] + ` You take ${damage} damage.`);
            State.variables.player.health -= damage;
        } else {
            State.variables.currentEncounter.enemyActions.push(actions[randomAction] + " It's a miss!");
        }
  }  
}