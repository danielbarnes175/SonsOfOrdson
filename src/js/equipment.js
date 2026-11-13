setup.registerDefinitions('items', {
  dagger: {
    name: 'Dagger',
    type: 'melee',
    slot: 'weapons',
    stackable: false,
    value: 5,
    attackAbility: 'dex',
    attackBonus: 2,
    combatAction: 'attack',
    damage: '1d4+2',
    throwable: true,
    requiresTwoHands: false,
    flavor: {
      criticalSuccess: 'You manage to catch the enemy off balance, and get an especially good hit.',
      criticalFailure: 'You swing your dagger and accidentally hit yourself!',
      success: [
        'You manage to hit the enemy.',
        'You hit the enemy.',
        'You hit the enemy with your dagger.',
      ],
      failure: [
        'You miss the enemy.',
        'You miss the enemy with your dagger.',
        'Swing and a miss.',
      ],
    },
    description: 'A small dagger. You could stab someone with this.',
    attackDescription: 'Attack with your dagger',
  },
  fist: {
    name: 'Fist',
    type: 'melee',
    slot: 'weapons',
    stackable: false,
    inventoryItem: false,
    value: 0,
    attackAbility: 'str',
    attackBonus: 0,
    combatAction: 'attack',
    damage: '1d2',
    throwable: false,
    requiresTwoHands: false,
    flavor: {
      criticalSuccess: 'You punch the enemy square in the face.',
      criticalFailure: 'You swing and manage to hit yourself with a punch. Wow.',
      success: [
        'You manage to hit the enemy.',
        'You hit the enemy.',
        'You hit the enemy with your fist.',
      ],
      failure: [
        'You miss the enemy.',
        'You miss the enemy with your fist.',
        'Swing and a miss.',
      ],
    },
    description: 'Your fist. Good for punching.',
    attackDescription: 'Punch with your fist',
  },
  ironHelmet: {
    name: 'Iron Helmet',
    type: 'armor',
    slot: 'head',
    stackable: false,
    value: 15,
    armorAmount: 3,
    description: 'An iron helmet that offers basic protection.',
  },
  ironChestplate: {
    name: 'Iron Chestplate',
    type: 'armor',
    slot: 'chest',
    stackable: false,
    value: 30,
    armorAmount: 5,
    description: 'An iron chestplate that offers basic protection.',
  },
  ironPlatelegs: {
    name: 'Iron Platelegs',
    type: 'armor',
    slot: 'legs',
    stackable: false,
    value: 25,
    armorAmount: 4,
    description: 'Iron platelegs that offers basic protection.',
  },
  ironBoots: {
    name: 'Iron Boots',
    type: 'armor',
    slot: 'feet',
    stackable: false,
    value: 10,
    armorAmount: 2,
    description: 'A pair of iron boots that offers basic protection.',
  },
  healthPotion: {
    name: 'Health Potion',
    type: 'consumable',
    slot: 'general',
    stackable: true,
    maxStack: 99,
    value: 10,
    effect: 'heal',
    amount: 10,
    description: 'Restores 10 health when consumed.',
  },
});

setup.inventorySlots = setup.deepFreeze([
  'head',
  'chest',
  'legs',
  'feet',
  'weapons',
  'general',
]);

setup.getItemDefinition = (item) => {
  if (!item) return null;
  const definitionId = typeof item === 'string' ? item : item.definitionId;
  return setup.getDefinition('items', definitionId);
};

setup.getInventoryItems = (slot) => {
  const { backpack } = State.variables.player.inventory;
  if (slot) return backpack[slot] || [];
  return setup.inventorySlots.reduce((items, slotId) => items.concat(backpack[slotId]), []);
};

setup.getInventoryItemById = (itemId) => {
  const item = setup.getInventoryItems().find((inventoryItem) => inventoryItem.id === itemId);
  return item || null;
};

setup.resolveInventoryItem = (item) => (
  typeof item === 'string' ? setup.getInventoryItemById(item) : item
);

setup.getItemQuantity = (definitionId) => setup.getInventoryItems()
  .filter((item) => item.definitionId === definitionId)
  .reduce((total, item) => total + (item.quantity || 1), 0);

setup.hasItem = (definitionId, quantity = 1) => (
  setup.getItemQuantity(definitionId) >= quantity
);

setup.addItemToInventory = (definitionId, quantity = 1, runtimeState = {}) => {
  const definition = setup.getDefinition('items', definitionId);
  if (!definition) throw new Error(`Unknown item definition: ${definitionId}`);
  if (definition.inventoryItem === false) {
    throw new Error(`${definitionId} cannot be added to an inventory.`);
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('Item quantity must be a positive integer.');
  }

  const { backpack } = State.variables.player.inventory;
  const slot = backpack[definition.slot] ? definition.slot : 'general';
  const maxStack = definition.stackable ? definition.maxStack || 99 : 1;
  const affectedItems = [];
  let remaining = quantity;

  if (definition.stackable) {
    backpack[slot]
      .filter((item) => item.definitionId === definitionId && item.quantity < maxStack)
      .forEach((item) => {
        if (remaining === 0) return;
        const added = Math.min(maxStack - item.quantity, remaining);
        Object.assign(item, { quantity: item.quantity + added });
        remaining -= added;
        affectedItems.push(item);
      });
  }

  while (remaining > 0) {
    const stackQuantity = Math.min(maxStack, remaining);
    const instanceState = definition.stackable
      ? { ...runtimeState, quantity: stackQuantity }
      : runtimeState;
    const item = setup.createRuntimeInstance('items', definitionId, 'item', instanceState);
    backpack[slot].push(item);
    affectedItems.push(item);
    remaining -= stackQuantity;
  }

  return {
    items: affectedItems,
    quantityAdded: quantity,
  };
};

setup.removeItemFromInventory = (itemId, quantity = 1) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { success: false, reason: 'Item quantity must be a positive integer.' };
  }

  const item = setup.getInventoryItemById(itemId);
  if (!item) return { success: false, reason: 'Item was not found.' };

  const definition = setup.getItemDefinition(item);
  const stackQuantity = item.quantity || 1;
  if (quantity > stackQuantity) {
    return { success: false, reason: 'Not enough items in this stack.' };
  }

  if (quantity < stackQuantity) {
    item.quantity -= quantity;
  } else {
    const slotItems = setup.getInventoryItems(definition.slot);
    slotItems.splice(slotItems.indexOf(item), 1);
    Object.keys(State.variables.player.inventory.currentlyEquipped).forEach((slot) => {
      if (State.variables.player.inventory.currentlyEquipped[slot] === itemId) {
        State.variables.player.inventory.currentlyEquipped[slot] = null;
      }
    });
  }

  return { success: true, item, quantityRemoved: quantity };
};

setup.removeItemsByDefinition = (definitionId, quantity = 1) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { success: false, reason: 'Item quantity must be a positive integer.' };
  }
  if (!setup.hasItem(definitionId, quantity)) {
    return { success: false, reason: `Not enough ${definitionId} items.` };
  }

  const matchingItems = setup.getInventoryItems()
    .filter((item) => item.definitionId === definitionId);
  let remaining = quantity;
  matchingItems.forEach((item) => {
    if (remaining === 0) return;
    const removed = Math.min(item.quantity || 1, remaining);
    setup.removeItemFromInventory(item.id, removed);
    remaining -= removed;
  });

  return { success: true, definitionId, quantityRemoved: quantity };
};

setup.equipItem = (itemId) => {
  const item = setup.getInventoryItemById(itemId);
  if (!item) return { success: false, reason: 'Item was not found.' };

  const definition = setup.getItemDefinition(item);
  if (!definition.slot || definition.slot === 'general') {
    return { success: false, reason: `${definition.name} cannot be equipped.` };
  }

  const equipped = State.variables.player.inventory.currentlyEquipped;
  const replacedItemId = equipped[definition.slot];
  equipped[definition.slot] = item.id;
  return {
    success: true,
    item,
    replacedItemId,
    slot: definition.slot,
  };
};

setup.unequipItem = (slot) => {
  const equipped = State.variables.player.inventory.currentlyEquipped;
  if (!Object.prototype.hasOwnProperty.call(equipped, slot)) {
    return { success: false, reason: `Unknown equipment slot: ${slot}` };
  }

  const itemId = equipped[slot];
  equipped[slot] = null;
  return { success: true, itemId, slot };
};

setup.getEquippedItem = (slot) => {
  const itemId = State.variables.player.inventory.currentlyEquipped[slot];
  return setup.getInventoryItemById(itemId);
};

setup.getPlayerArmor = () => Object.keys(State.variables.player.inventory.currentlyEquipped)
  .map((slot) => setup.getItemDefinition(setup.getEquippedItem(slot)))
  .filter((definition) => definition && definition.type === 'armor')
  .reduce((armor, definition) => armor + definition.armorAmount, 0);

setup.itemEffects = {
  heal(definition) {
    const { player } = State.variables;
    if (player.health >= player.maxHealth) {
      return { success: false, reason: 'Your health is already full.' };
    }

    const previousHealth = player.health;
    player.health = Math.min(player.health + definition.amount, player.maxHealth);
    return { success: true, amount: player.health - previousHealth };
  },
};

setup.useItem = (itemId) => {
  const item = setup.getInventoryItemById(itemId);
  if (!item) return { success: false, reason: 'Item was not found.' };

  const definition = setup.getItemDefinition(item);
  const applyEffect = setup.itemEffects[definition.effect];
  if (!applyEffect) {
    return { success: false, reason: `${definition.name} cannot be used.` };
  }

  const result = applyEffect(definition, item);
  if (!result.success) return result;
  if (definition.type === 'consumable') setup.removeItemFromInventory(item.id, 1);
  return { ...result, item, definition };
};

macros.useItem = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const item = setup.resolveInventoryItem(params[0]);
    const result = setup.useItem(item ? item.id : params[0]);
    if (!result.success) new Wikifier(place, result.reason);
  },
  init() { },
};

macros.equipItem = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const item = setup.resolveInventoryItem(params[0]);
    const result = setup.equipItem(item ? item.id : params[0]);
    if (!result.success) new Wikifier(place, result.reason);
  },
  init() { },
};

macros.unequipItemHelper = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.unequipItem(params[0]);
  },
  init() { },
};

macros.getStarterEquipment = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.addItemToInventory('dagger');
    setup.addItemToInventory('ironHelmet');
    setup.addItemToInventory('ironChestplate');
    setup.addItemToInventory('ironPlatelegs');
    setup.addItemToInventory('ironBoots');

    setup.addItemToInventory('healthPotion', 5);
  },
  init() { },
};

macros.getCurrentlyEquipped = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const equipped = State.variables.player.inventory.currentlyEquipped;
    const getName = (itemId) => {
      const definition = setup.getItemDefinition(setup.getInventoryItemById(itemId));
      return definition ? definition.name : 'None';
    };
    new Wikifier(place, `Head: ${getName(equipped.head)}\n`);
    new Wikifier(place, `Chest: ${getName(equipped.chest)}\n`);
    new Wikifier(place, `Legs: ${getName(equipped.legs)}\n`);
    new Wikifier(place, `Feet: ${getName(equipped.feet)}\n\n`);

    new Wikifier(place, `Weapons: ${getName(equipped.weapons)}`);
  },
  init() { },
};

macros.addItemToInventoryHelper = {
  /* eslint-disable-next-line */
   handler(place, macroName, params, parser) {
    setup.addItemToInventory(params[0], params[1] || 1);
  },
  init() { },
};

macros.removeItemFromInventoryHelper = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const item = setup.resolveInventoryItem(params[0]);
    const result = setup.removeItemFromInventory(item ? item.id : params[0], params[1] || 1);
    if (!result.success) new Wikifier(place, result.reason);
  },
  init() { },
};

macros.removeItemsByDefinitionHelper = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const result = setup.removeItemsByDefinition(params[0], params[1] || 1);
    if (!result.success) new Wikifier(place, result.reason);
  },
  init() { },
};
