setup.registerDefinitions('items', {
  dagger: {
    name: 'Dagger',
    type: 'melee',
    slot: 'weapons',
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
    armorAmount: 3,
    description: 'An iron helmet that offers basic protection.',
  },
  ironChestplate: {
    name: 'Iron Chestplate',
    type: 'armor',
    slot: 'chest',
    armorAmount: 5,
    description: 'An iron chestplate that offers basic protection.',
  },
  ironPlatelegs: {
    name: 'Iron Platelegs',
    type: 'armor',
    slot: 'legs',
    armorAmount: 4,
    description: 'Iron platelegs that offers basic protection.',
  },
  ironBoots: {
    name: 'Iron Boots',
    type: 'armor',
    slot: 'feet',
    armorAmount: 2,
    description: 'A pair of iron boots that offers basic protection.',
  },
  healthPotion: {
    name: 'Health Potion',
    type: 'consumable',
    slot: 'general',
    effect: 'heal',
    amount: 10,
  },
});

setup.getItemDefinition = (item) => (
  item ? setup.getDefinition('items', item.definitionId || item.id) : null
);

setup.getInventoryItemById = (itemId) => {
  const { backpack } = State.variables.player.inventory;
  const items = Object.values(backpack).reduce((allItems, slotItems) => (
    allItems.concat(slotItems)
  ), []);
  return items.find((item) => item.id === itemId) || null;
};

macros.useItem = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const item = params[0];
    const definition = setup.getItemDefinition(item);
    let itemUsed = true;
    switch (definition.effect) {
      case 'heal':
        State.variables.player.health += definition.amount;
        if (State.variables.player.health > State.variables.player.maxHealth) {
          State.variables.player.health = State.variables.player.maxHealth;
        }
        break;
      default:
        // eslint-disable-next-line no-console
        console.error(`No item use implemented for type ${definition.effect}`);
        itemUsed = false;
        break;
    }

    if (definition.type === 'consumable' && itemUsed) {
      const index = State.variables.player.inventory.backpack.general.indexOf(item);
      State.variables.player.inventory.backpack.general.splice(index, 1);
    }
  },
  init() { },
};

macros.equipItem = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const item = params[0];
    const definition = setup.getItemDefinition(item);

    if (State.variables.player.inventory.currentlyEquipped[definition.slot]) {
      setup.unequipItem(definition.slot);
    }

    State.variables.player.inventory.currentlyEquipped[definition.slot] = item.id;
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

setup.unequipItem = (itemSlot) => {
  State.variables.player.inventory.currentlyEquipped[itemSlot] = null;
};

macros.getStarterEquipment = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.addItemToInventory('dagger');
    setup.addItemToInventory('ironHelmet');
    setup.addItemToInventory('ironChestplate');
    setup.addItemToInventory('ironPlatelegs');
    setup.addItemToInventory('ironBoots');

    for (let i = 0; i < 5; i++) {
      setup.addItemToInventory('healthPotion');
    }
  },
  init() { },
};

macros.getCurrentlyEquipped = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const equipped = State.variables.player.inventory.currentlyEquipped;
    const getName = (itemId) => {
      const item = setup.getInventoryItemById(itemId);
      const definition = setup.getItemDefinition(item);
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
    setup.addItemToInventory(params[0]);
  },
  init() { },
};

setup.addItemToInventory = (item) => {
  const definitionId = typeof item === 'string'
    ? item
    : item.definitionId || item.id;
  const newItem = setup.createRuntimeInstance('items', definitionId, 'item');
  const definition = setup.getDefinition('items', definitionId);
  const inventory = State.variables.player.inventory.backpack;
  const slot = inventory[definition.slot] ? definition.slot : 'general';
  inventory[slot].push(newItem);
  return newItem;
};
