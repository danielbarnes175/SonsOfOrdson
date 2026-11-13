/* eslint-env node */
/* eslint-disable no-console */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(__dirname, '..');
const sourceFiles = [
  'src/js/00-state.js',
  'src/js/combat.js',
  'src/js/enemies.js',
  'src/js/equipment.js',
  'src/js/guild.js',
  'src/js/player.js',
  'src/js/quests.js',
  'src/js/shops.js',
  'src/js/stats.js',
  'src/macros/time-macro/time.js',
];

const context = vm.createContext({
  clone: (value) => JSON.parse(JSON.stringify(value)),
  console,
  macros: {},
  Math,
  setup: {},
  State: { variables: {} },
});

sourceFiles.forEach((relativePath) => {
  const source = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
  vm.runInContext(source, context, { filename: relativePath });
});

const { setup, State, macros } = context;

const assertDeeplyFrozen = (value) => {
  if (!value || typeof value !== 'object') return;
  assert(Object.isFrozen(value));
  Object.values(value).forEach(assertDeeplyFrozen);
};

const assertHasNoFunctions = (value) => {
  assert.notStrictEqual(typeof value, 'function');
  if (!value || typeof value !== 'object') return;
  Object.values(value).forEach(assertHasNoFunctions);
};

Object.values(setup.data).forEach(assertDeeplyFrozen);
assertHasNoFunctions(State.variables);
assert.doesNotThrow(() => JSON.stringify(State.variables));
assert.strictEqual(State.variables.system.schemaVersion, 5);

const dagger = setup.addItemToInventory('dagger').items[0];
const potion = setup.addItemToInventory('healthPotion', 5).items[0];
assert.deepStrictEqual(Object.keys(dagger).sort(), ['definitionId', 'id']);
assert.strictEqual(dagger.definitionId, 'dagger');
assert.notStrictEqual(dagger.id, potion.id);
assert.strictEqual(potion.quantity, 5);
assert.strictEqual(setup.getItemQuantity('healthPotion'), 5);
assert.strictEqual(setup.hasItem('healthPotion', 5), true);

setup.equipItem(dagger.id);
assert.strictEqual(State.variables.player.inventory.currentlyEquipped.weapons, dagger.id);
assert.strictEqual(setup.getInventoryItemById(dagger.id), dagger);

State.variables.player.health = 20;
setup.useItem(potion.id);
assert.strictEqual(State.variables.player.health, 30);
assert.strictEqual(potion.quantity, 4);
assert.strictEqual(setup.getItemQuantity('healthPotion'), 4);

const fullHealthResult = setup.useItem(potion.id);
assert.strictEqual(fullHealthResult.success, false);
assert.strictEqual(potion.quantity, 4);

setup.removeItemFromInventory(potion.id, 4);
assert.strictEqual(State.variables.player.inventory.backpack.general.length, 0);

setup.removeItemFromInventory(dagger.id);
assert.strictEqual(State.variables.player.inventory.currentlyEquipped.weapons, null);
assert.strictEqual(setup.getInventoryItemById(dagger.id), null);

const helmet = setup.addItemToInventory('ironHelmet').items[0];
setup.equipItem(helmet.id);
assert.strictEqual(setup.getPlayerArmor(), 3);
assert.throws(() => setup.addItemToInventory('fist'));

setup.addItemToInventory('healthPotion', 105);
const potionStacks = setup.getInventoryItems('general');
assert.strictEqual(potionStacks.length, 2);
assert.strictEqual(potionStacks[0].quantity, 99);
assert.strictEqual(potionStacks[1].quantity, 6);
assert.strictEqual(setup.getItemQuantity('healthPotion'), 105);
assert.strictEqual(setup.removeItemsByDefinition('healthPotion', 100).success, true);
assert.strictEqual(setup.getItemQuantity('healthPotion'), 5);
assert.strictEqual(setup.removeItemsByDefinition('healthPotion', 6).success, false);
assert.strictEqual(setup.getItemQuantity('healthPotion'), 5);

const enemy = setup.getRandomEnemies(1)[0];
assert.deepStrictEqual(Object.keys(enemy).sort(), ['definitionId', 'health', 'id']);
assert.strictEqual(enemy.health, setup.getDefinition('enemies', enemy.definitionId).maxHealth);

setup.rollDice = (expression) => (expression === '1d20' ? 20 : 2);
setup.randomInteger = (minimum) => minimum;
State.variables.player.health = State.variables.player.maxHealth;
State.variables.guilds.adventurersGuild.isPlayerMemberOf = true;
const combatEnemy = setup.createEnemy('goblin', { health: 2 });
const encounter = setup.startEncounter([combatEnemy], { returnPassage: 'Outside' });
assert.strictEqual(encounter.status, 'active');
assert.strictEqual(encounter.returnPassage, 'Outside');
assert.strictEqual(encounter.playerActionIds.join(','), 'fist');
assert.strictEqual(encounter.initiative[0].actorType, 'player');
assert.strictEqual(setup.progressEncounter('fist', 'missing-enemy').success, false);

const combatResult = setup.progressEncounter('fist', combatEnemy.id);
assert.strictEqual(combatResult.success, true);
assert.strictEqual(encounter.status, 'won');
assert.strictEqual(combatEnemy.health, 0);
assert.strictEqual(State.variables.guilds.adventurersGuild.currentProgress, 1);
assert.strictEqual(encounter.rewards.gold, 10);
assert.strictEqual(encounter.rewards.exp, 50);

const startingGold = State.variables.player.gold;
const startingExp = State.variables.player.exp;
assert.strictEqual(setup.claimEncounterRewards().success, true);
assert.strictEqual(State.variables.player.gold, startingGold + 10);
assert.strictEqual(State.variables.player.exp, startingExp + 50);
assert.strictEqual(setup.claimEncounterRewards().success, false);
assert.strictEqual(State.variables.player.gold, startingGold + 10);
setup.endEncounter();
assert.strictEqual(State.variables.currentEncounter.status, 'none');
assertHasNoFunctions(State.variables);
assert.doesNotThrow(() => JSON.stringify(State.variables));

const testQuestId = 'test quest';
assert.strictEqual(setup.isQuestStatus(testQuestId, setup.questStatuses.hidden), true);
assert.strictEqual(setup.claimQuestRewards(testQuestId).success, false);
assert.strictEqual(setup.discoverQuest(testQuestId).success, true);
assert.strictEqual(setup.isQuestStatus(testQuestId, setup.questStatuses.available), true);
assert.strictEqual(setup.discoverQuest(testQuestId).success, false);
assert.strictEqual(setup.startQuest(testQuestId).success, true);
assert.strictEqual(setup.isQuestObjective(testQuestId, 'finishTest'), true);
assert.strictEqual(setup.advanceQuest(testQuestId, 'wrongObjective').success, false);
assert.strictEqual(setup.advanceQuest(testQuestId, 'finishTest').success, true);
assert.strictEqual(setup.isQuestStatus(testQuestId, setup.questStatuses.completed), true);

const questRewardGold = State.variables.player.gold;
const questRewardExp = State.variables.player.exp;
const questRewardPotions = setup.getItemQuantity('healthPotion');
assert.strictEqual(setup.claimQuestRewards(testQuestId).success, true);
assert.strictEqual(State.variables.player.gold, questRewardGold + 10);
assert.strictEqual(State.variables.player.exp, questRewardExp + 20);
assert.strictEqual(setup.getItemQuantity('healthPotion'), questRewardPotions + 2);
assert.strictEqual(setup.claimQuestRewards(testQuestId).success, false);
assert.strictEqual(State.variables.player.gold, questRewardGold + 10);
assert.strictEqual(setup.getItemQuantity('healthPotion'), questRewardPotions + 2);

const thievesQuestId = 'Thieves Guild Entrance Exam';
assert.strictEqual(setup.startQuest(thievesQuestId).success, true);
assert.strictEqual(setup.setQuestObjective(thievesQuestId, 'returnArtifact').success, true);
assert.strictEqual(setup.isQuestObjective(thievesQuestId, 'returnArtifact'), true);
assert.strictEqual(setup.failQuest(thievesQuestId).success, true);
assert.strictEqual(setup.isQuestStatus(thievesQuestId, setup.questStatuses.failed), true);

const bubbleShopId = 'bubbleAndBroil';
const metalShopId = 'generalMetalworks';
const bubbleRelation = setup.getShopRelation(bubbleShopId);
bubbleRelation.currentProgress = 0;
assert.strictEqual(setup.getShopBuyPrice(bubbleShopId, 'healthPotion'), 10);
assert.strictEqual(setup.getShopSellPrice(bubbleShopId, 'healthPotion'), 5);
bubbleRelation.currentProgress = 50;
assert.strictEqual(setup.getShopBuyPrice(bubbleShopId, 'healthPotion'), 9);
assert.strictEqual(setup.getShopSellPrice(bubbleShopId, 'healthPotion'), 6);
bubbleRelation.currentProgress = 100;
assert.strictEqual(setup.getShopBuyPrice(bubbleShopId, 'healthPotion'), 8);
assert.strictEqual(setup.getShopSellPrice(bubbleShopId, 'healthPotion'), 7);
bubbleRelation.currentProgress = 0;
const metalRelation = setup.getShopRelation(metalShopId);
metalRelation.currentProgress = 0;
assert.strictEqual(setup.getShopSellPrice(metalShopId, 'dagger'), 2);
metalRelation.currentProgress = 50;
assert.strictEqual(setup.getShopBuyPrice(metalShopId, 'dagger'), 5);
metalRelation.currentProgress = 0;

assert.strictEqual(setup.openShop('missingShop', 'Outside').success, false);
assert.strictEqual(setup.openShop(bubbleShopId, 'Bubble and Broil').success, true);
assert.strictEqual(State.variables.shopSession.shopId, bubbleShopId);
assert.strictEqual(State.variables.shopSession.returnPassage, 'Bubble and Broil');

State.variables.player.gold = 100;
const potionsBeforePurchase = setup.getItemQuantity('healthPotion');
const bulkPurchase = setup.buyFromShop(bubbleShopId, 'healthPotion', 5);
assert.strictEqual(bulkPurchase.success, true);
assert.strictEqual(State.variables.player.gold, 50);
assert.strictEqual(setup.getItemQuantity('healthPotion'), potionsBeforePurchase + 5);
assert.strictEqual(bubbleRelation.currentProgress, 0);

const weaponsBeforePurchase = setup.getInventoryItems('weapons').length;
const equipmentPurchase = setup.buyFromShop(metalShopId, 'dagger', 2);
assert.strictEqual(equipmentPurchase.success, true);
const purchasedWeapons = setup.getInventoryItems('weapons');
assert.strictEqual(purchasedWeapons.length, weaponsBeforePurchase + 2);
assert.notStrictEqual(
  purchasedWeapons[purchasedWeapons.length - 1].id,
  purchasedWeapons[purchasedWeapons.length - 2].id,
);

State.variables.player.gold = 0;
const potionsBeforeRejection = setup.getItemQuantity('healthPotion');
assert.strictEqual(setup.buyFromShop(bubbleShopId, 'healthPotion', 1).success, false);
assert.strictEqual(State.variables.player.gold, 0);
assert.strictEqual(setup.getItemQuantity('healthPotion'), potionsBeforeRejection);
assert.strictEqual(setup.buyFromShop(bubbleShopId, 'dagger', 1).success, false);
assert.strictEqual(setup.getInventoryItems('weapons').length, purchasedWeapons.length);

const potionStack = setup.getInventoryItems('general')
  .find((item) => item.definitionId === 'healthPotion');
const potionQuantityBeforeSale = potionStack.quantity;
const bulkSale = setup.sellToShop(bubbleShopId, potionStack.id, 5);
assert.strictEqual(bulkSale.success, true);
assert.strictEqual(State.variables.player.gold, 25);
assert.strictEqual(potionStack.quantity, potionQuantityBeforeSale - 5);
assert.strictEqual(bubbleRelation.currentProgress, 0);

const goldBeforeRejectedSale = State.variables.player.gold;
assert.strictEqual(setup.sellToShop(metalShopId, potionStack.id, 1).success, false);
assert.strictEqual(setup.sellToShop(bubbleShopId, potionStack.id, 100).success, false);
assert.strictEqual(setup.sellToShop(metalShopId, helmet.id, 1).success, false);
assert.strictEqual(State.variables.player.gold, goldBeforeRejectedSale);
assert.strictEqual(potionStack.quantity, potionQuantityBeforeSale - 5);
assert.strictEqual(setup.getInventoryItemById(helmet.id), helmet);

setup.setShopSessionMessage('Transaction complete.');
assert.strictEqual(State.variables.shopSession.lastMessage, 'Transaction complete.');
assert.strictEqual(setup.closeShop().success, true);
assert.strictEqual(State.variables.shopSession.shopId, null);
assert.strictEqual(State.variables.shopSession.returnPassage, null);
assert.strictEqual(setup.adjustShopProgress(bubbleShopId, 150).currentProgress, 100);
assert.strictEqual(setup.adjustShopProgress(bubbleShopId, -200).currentProgress, 0);

const chemicalRelation = setup.getShopRelation('chemicalImbalance');
const greenRavenRelation = setup.getShopRelation('greenRaven');
const linenDreamsRelation = setup.getShopRelation('linenDreams');
greenRavenRelation.currentProgress = 1;
linenDreamsRelation.currentProgress = 1;
const workGold = State.variables.player.gold;
const workResult = setup.workForShop('chemicalImbalance');
assert.strictEqual(workResult.success, true);
assert.strictEqual(State.variables.player.gold, workGold + 5);
assert.strictEqual(chemicalRelation.currentProgress, 1);
assert.strictEqual(greenRavenRelation.currentProgress, 0);
assert.strictEqual(linenDreamsRelation.currentProgress, 0);
assertHasNoFunctions(State.variables);
assert.doesNotThrow(() => JSON.stringify(State.variables));

State.variables.player.name = 'Changed';
assert.strictEqual(setup.playerDefaults.name, 'Bob');
assert.deepStrictEqual(Object.keys(State.variables.quests.questLog['test quest']).sort(), [
  'objectiveIndex',
  'rewardClaimed',
  'status',
]);

console.log('State foundation validated: definitions are frozen and runtime state is serializable.');
