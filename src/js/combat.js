setup.createEmptyEncounter = () => ({
  status: 'none',
  round: -1,
});

State.variables.currentEncounter = setup.createEmptyEncounter();

setup.rollDice = (expression) => dice(expression);

setup.randomInteger = (minimum, maximum) => (
  Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
);

setup.randomFrom = (values) => values[setup.randomInteger(0, values.length - 1)];

setup.createEnemy = (definitionId, runtimeState = {}) => {
  const definition = setup.getDefinition('enemies', definitionId);
  if (!definition) throw new Error(`Unknown enemy definition: ${definitionId}`);

  const health = runtimeState.health === undefined
    ? definition.maxHealth
    : runtimeState.health;
  return setup.createRuntimeInstance('enemies', definitionId, 'enemy', {
    ...runtimeState,
    health,
  });
};

setup.getRandomEnemies = (maxEnemyCount) => {
  if (!Number.isInteger(maxEnemyCount) || maxEnemyCount < 1) {
    throw new Error('Maximum enemy count must be a positive integer.');
  }

  const enemyKeys = Object.keys(setup.data.enemies);
  const numberOfEnemies = setup.randomInteger(1, maxEnemyCount);
  const enemies = [];
  for (let i = 0; i < numberOfEnemies; i++) {
    enemies.push(setup.createEnemy(setup.randomFrom(enemyKeys)));
  }
  return enemies;
};

setup.getAliveEnemies = (encounter = State.variables.currentEncounter) => (
  encounter.enemies ? encounter.enemies.filter((enemy) => enemy.health > 0) : []
);

setup.getEnemyById = (enemyId, encounter = State.variables.currentEncounter) => (
  encounter.enemies ? encounter.enemies.find((enemy) => enemy.id === enemyId) || null : null
);

setup.getPlayerCombatActionIds = () => {
  const actionIds = ['fist'];
  const weapon = setup.getEquippedItem('weapons');
  const definition = setup.getItemDefinition(weapon);
  if (definition && definition.combatAction) actionIds.unshift(definition.id);
  return actionIds;
};

setup.getPlayerDefense = () => {
  const dexterity = setup.getPlayerAbilityModifier('dex');
  const armor = Math.floor(setup.getPlayerArmor() / 2);
  return 10 + dexterity + armor;
};

setup.getInitiative = (actorType, actor) => {
  const dexterity = actorType === 'player'
    ? setup.getPlayerAbilityModifier('dex')
    : setup.getAbilityModifier(setup.getDefinition('enemies', actor.definitionId).stats.dex);
  return setup.rollDice('1d20') + dexterity;
};

setup.buildInitiativeOrder = (enemies) => {
  const initiative = [{
    actorId: 'player',
    actorType: 'player',
    total: setup.getInitiative('player', State.variables.player),
  }];
  enemies.forEach((enemy) => {
    initiative.push({
      actorId: enemy.id,
      actorType: 'enemy',
      total: setup.getInitiative('enemy', enemy),
    });
  });
  return initiative.sort((left, right) => {
    if (right.total !== left.total) return right.total - left.total;
    if (left.actorType !== right.actorType) return left.actorType === 'player' ? -1 : 1;
    return left.actorId.localeCompare(right.actorId);
  });
};

setup.startEncounter = (enemyReferences, options = {}) => {
  if (!Array.isArray(enemyReferences) || enemyReferences.length === 0) {
    throw new Error('An encounter requires at least one enemy.');
  }

  const enemies = enemyReferences.map((enemy) => (
    typeof enemy === 'string' ? setup.createEnemy(enemy) : enemy
  ));
  enemies.forEach((enemy) => {
    if (!setup.getDefinition('enemies', enemy.definitionId)) {
      throw new Error(`Unknown enemy definition: ${enemy.definitionId}`);
    }
  });

  const actionIds = setup.getPlayerCombatActionIds();
  const messages = enemies.map((enemy) => {
    const definition = setup.getDefinition('enemies', enemy.definitionId);
    return `A ${definition.name} appears before you.`;
  });
  const system = setup.ensureSystemState();
  const encounterId = `encounter-${system.nextEntityId}`;
  system.nextEntityId += 1;

  State.variables.currentEncounter = {
    id: encounterId,
    status: 'active',
    round: 1,
    returnPassage: options.returnPassage || State.variables.player.location,
    enemies,
    defeatedEnemyIds: [],
    initiative: setup.buildInitiativeOrder(enemies),
    playerActionIds: actionIds,
    selectedActionId: actionIds[0],
    selectedTargetId: enemies[0].id,
    messages,
    rewards: {
      claimed: false,
      exp: 0,
      gold: 0,
    },
  };
  return State.variables.currentEncounter;
};

setup.getPlayerAttackBonus = (action) => {
  const ability = action.attackAbility || 'str';
  return setup.getPlayerAbilityModifier(ability) + (action.attackBonus || 0);
};

setup.resolvePlayerAttack = (action, target) => {
  const encounter = State.variables.currentEncounter;
  const targetDefinition = setup.getDefinition('enemies', target.definitionId);
  const naturalRoll = setup.rollDice('1d20');
  const attackTotal = naturalRoll + setup.getPlayerAttackBonus(action);

  if (naturalRoll === 1) {
    const selfDamage = Math.max(1, Math.floor(setup.rollDice(action.damage) / 2));
    State.variables.player.health = Math.max(0, State.variables.player.health - selfDamage);
    encounter.messages.push(`${action.flavor.criticalFailure} You take ${selfDamage} damage.`);
    return {
      critical: 'failure',
      damage: selfDamage,
      hit: false,
      naturalRoll,
    };
  }

  const hit = naturalRoll === 20 || attackTotal >= targetDefinition.armorClass;
  if (!hit) {
    const message = setup.randomFrom(action.flavor.failure);
    encounter.messages.push(`${message} (${attackTotal} vs. ${targetDefinition.armorClass} AC)`);
    return { damage: 0, hit: false, naturalRoll };
  }

  const baseDamage = setup.rollDice(action.damage);
  const damage = naturalRoll === 20 ? baseDamage * 2 : baseDamage;
  Object.assign(target, { health: Math.max(0, target.health - damage) });
  const flavor = naturalRoll === 20
    ? action.flavor.criticalSuccess
    : setup.randomFrom(action.flavor.success);
  encounter.messages.push(`${flavor} ${damage} damage to the ${targetDefinition.name}.`);
  return {
    critical: naturalRoll === 20 ? 'success' : null,
    damage,
    hit: true,
    naturalRoll,
  };
};

setup.combatActionHandlers = {
  attack(action, target) {
    return setup.resolvePlayerAttack(action, target);
  },
};

setup.resolveEnemyAttack = (enemy) => {
  const encounter = State.variables.currentEncounter;
  const definition = setup.getDefinition('enemies', enemy.definitionId);
  const naturalRoll = setup.rollDice('1d20');
  const attackTotal = naturalRoll + definition.attackBonus;
  const playerDefense = setup.getPlayerDefense();
  const attackDescription = setup.randomFrom(definition.attackDescriptions);
  const hit = naturalRoll === 20 || (naturalRoll !== 1 && attackTotal >= playerDefense);

  if (!hit) {
    encounter.messages.push(`${attackDescription} It's a miss! (${attackTotal} vs. ${playerDefense} defense)`);
    return { damage: 0, hit: false, naturalRoll };
  }

  const baseDamage = setup.rollDice(definition.damage);
  const damage = naturalRoll === 20 ? baseDamage * 2 : baseDamage;
  State.variables.player.health = Math.max(0, State.variables.player.health - damage);
  encounter.messages.push(`${attackDescription} You take ${damage} damage.`);
  return {
    critical: naturalRoll === 20,
    damage,
    hit: true,
    naturalRoll,
  };
};

setup.recordDefeatedEnemies = () => {
  const encounter = State.variables.currentEncounter;
  encounter.enemies.forEach((enemy) => {
    if (enemy.health > 0 || encounter.defeatedEnemyIds.includes(enemy.id)) return;

    encounter.defeatedEnemyIds.push(enemy.id);
    const definition = setup.getDefinition('enemies', enemy.definitionId);
    encounter.messages.push(`The ${definition.name} is defeated.`);
    if (State.variables.guilds.adventurersGuild.isPlayerMemberOf) {
      const relation = State.variables.guilds.adventurersGuild;
      const guild = setup.getDefinition('guilds', 'adventurersGuild');
      relation.currentProgress = Math.min(
        relation.currentProgress + definition.guildProgress,
        guild.maxProgress,
      );
    }
  });
};

setup.generateEncounterRewards = (encounter) => {
  const rewards = encounter.enemies.reduce((total, enemy) => {
    const definition = setup.getDefinition('enemies', enemy.definitionId);
    const gold = setup.randomInteger(definition.rewards.gold.min, definition.rewards.gold.max);
    const exp = setup.randomInteger(definition.rewards.exp.min, definition.rewards.exp.max);
    return {
      exp: total.exp + exp,
      gold: total.gold + gold,
    };
  }, { exp: 0, gold: 0 });
  Object.assign(encounter.rewards, rewards);
};

setup.updateEncounterStatus = () => {
  const encounter = State.variables.currentEncounter;
  setup.recordDefeatedEnemies();
  if (State.variables.player.health <= 0) {
    encounter.status = 'lost';
    return encounter.status;
  }
  if (setup.getAliveEnemies(encounter).length === 0) {
    encounter.status = 'won';
    setup.generateEncounterRewards(encounter);
  }
  return encounter.status;
};

setup.progressEncounter = (actionId, targetId) => {
  const encounter = State.variables.currentEncounter;
  if (encounter.status !== 'active') {
    return { success: false, reason: 'There is no active encounter.' };
  }
  if (!encounter.playerActionIds.includes(actionId)) {
    return { success: false, reason: 'That combat action is not available.' };
  }

  const target = setup.getEnemyById(targetId, encounter);
  if (!target || target.health <= 0) {
    return { success: false, reason: 'That target is not available.' };
  }

  const action = setup.getDefinition('items', actionId);
  const actionHandler = setup.combatActionHandlers[action.combatAction];
  if (!actionHandler) {
    return { success: false, reason: 'That combat action is not implemented.' };
  }
  encounter.selectedActionId = actionId;
  encounter.selectedTargetId = targetId;
  encounter.messages = [];

  encounter.initiative.forEach((turn) => {
    if (encounter.status !== 'active') return;
    if (turn.actorType === 'player') {
      if (State.variables.player.health > 0 && target.health > 0) {
        actionHandler(action, target);
      }
    } else {
      const enemy = setup.getEnemyById(turn.actorId, encounter);
      if (enemy && enemy.health > 0) setup.resolveEnemyAttack(enemy);
    }
    setup.updateEncounterStatus();
  });

  encounter.round += 1;
  const nextTarget = setup.getAliveEnemies(encounter)[0];
  if (nextTarget && target.health <= 0) encounter.selectedTargetId = nextTarget.id;
  return { success: true, status: encounter.status, messages: encounter.messages };
};

setup.claimEncounterRewards = () => {
  const encounter = State.variables.currentEncounter;
  if (encounter.status !== 'won') {
    return { success: false, reason: 'The encounter has not been won.' };
  }
  if (encounter.rewards.claimed) {
    return { success: false, reason: 'Encounter rewards have already been claimed.' };
  }

  State.variables.player.gold += encounter.rewards.gold;
  State.variables.player.exp += encounter.rewards.exp;
  encounter.rewards.claimed = true;
  return {
    success: true,
    exp: encounter.rewards.exp,
    gold: encounter.rewards.gold,
  };
};

setup.endEncounter = () => {
  State.variables.currentEncounter = setup.createEmptyEncounter();
};

setup.recoverPlayerFromDefeat = () => {
  const encounter = State.variables.currentEncounter;
  if (encounter.status !== 'lost' || State.variables.player.health > 0) {
    return { success: false, reason: 'The player has not been defeated.' };
  }

  State.variables.player.health = State.variables.player.maxHealth;
  setup.endEncounter();
  return { success: true, healthRestored: State.variables.player.maxHealth };
};

macros.setupEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.startEncounter(params[1], { returnPassage: State.variables.player.location });
  },
  init() { },
};

macros.progressEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const result = setup.progressEncounter(params[0], params[1]);
    if (!result.success) new Wikifier(place, result.reason);
  },
  init() { },
};

macros.endEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.endEncounter();
  },
  init() { },
};

macros.recoverPlayerFromDefeat = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const result = setup.recoverPlayerFromDefeat();
    if (!result.success) new Wikifier(place, result.reason);
  },
  init() { },
};

macros.processEncounterWon = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const encounter = State.variables.currentEncounter;
    const result = setup.claimEncounterRewards();
    const rewards = result.success ? result : encounter.rewards;
    new Wikifier(place, "You've received:\n");
    new Wikifier(place, `${rewards.gold} Gold\n`);
    new Wikifier(place, `${rewards.exp} Exp\n`);
  },
  init() { },
};
