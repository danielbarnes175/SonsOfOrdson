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
assert.strictEqual(State.variables.system.schemaVersion, 2);

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

State.variables.player.name = 'Changed';
assert.strictEqual(setup.playerDefaults.name, 'Bob');
assert.deepStrictEqual(Object.keys(State.variables.quests.questLog['test quest']).sort(), [
  'currentStep',
  'knownQuest',
  'rewardClaimed',
]);

console.log('State foundation validated: definitions are frozen and runtime state is serializable.');
