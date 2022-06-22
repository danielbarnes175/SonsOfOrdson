State.variables.weapons = {
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
    isCurrentlyEquipped: false,
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
    isCurrentlyEquipped: true,
  },
};

State.variables.headEquipment = {
  ironHelmet: {
    name: 'Iron Helmet',
    type: 'armor',
    slot: 'head',
    armorAmount: '3',
    description: 'An iron helmet that offers basic protection.',
    isCurrentlyEquipped: false,
  },
};

State.variables.chestEquipment = {
  ironChestplate: {
    name: 'Iron Chestplate',
    type: 'armor',
    slot: 'chest',
    armorAmount: '5',
    description: 'An iron chestplate that offers basic protection.',
    isCurrentlyEquipped: false,
  },
};

State.variables.legEquipment = {
  ironPlatelegs: {
    name: 'Iron Platelegs',
    type: 'armor',
    slot: 'legs',
    armorAmount: '4',
    description: 'Iron platelegs that offers basic protection.',
    isCurrentlyEquipped: false,
  },
};

State.variables.feetEquipment = {
  ironBoots: {
    name: 'Iron Boots',
    type: 'armor',
    slot: 'feet',
    armorAmount: '2',
    description: 'A pair of iron boots that offers basic protection.',
    isCurrentlyEquipped: false,
  },
};

State.variables.generalEquipment = {
  healthPotion: {
    name: 'Health Potion',
    type: 'consumable',
    slot: 'general',
    effect: 'heal',
    amount: 10,
  },
};

macros.useItem = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const item = params[0];
    let itemUsed = true;
    switch (item.effect) {
      case 'heal':
        State.variables.player.health += item.amount;
        if (State.variables.player.health > State.variables.player.maxHealth) {
          State.variables.player.health = State.variables.player.maxHealth;
        }
        break;
      default:
        console.error(`No item use implemented for type ${item.effect}`);
        itemUsed = false;
        break;
    }

    if (item.type === 'consumable' && itemUsed) {
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

    if (State.variables.player.inventory.currentlyEquipped[item.slot]) unequipItem(item.slot);

    State.variables.player.inventory.currentlyEquipped[item.slot] = item;
  },
  init() { },
};

macros.unequipItemHelper = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    unequipItem(params[0]);
  },
  init() { },
};

let unequipItem = (itemSlot) => {
  State.variables.player.inventory.currentlyEquipped[itemSlot] = {
    name: 'None',
  };
};

macros.getStarterEquipment = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    addItemToInventory(State.variables.weapons.dagger);
    addItemToInventory(State.variables.headEquipment.ironHelmet);
    addItemToInventory(State.variables.chestEquipment.ironChestplate);
    addItemToInventory(State.variables.legEquipment.ironPlatelegs);
    addItemToInventory(State.variables.feetEquipment.ironBoots);

    for (let i = 0; i < 5; i++) {
      addItemToInventory(State.variables.generalEquipment.healthPotion);
    }
  },
  init() { },
};

macros.getCurrentlyEquipped = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    new Wikifier(place, `Head: ${State.variables.player.inventory.currentlyEquipped.head.name}\n`);
    new Wikifier(place, `Chest: ${State.variables.player.inventory.currentlyEquipped.chest.name}\n`);
    new Wikifier(place, `Legs: ${State.variables.player.inventory.currentlyEquipped.legs.name}\n`);
    new Wikifier(place, `Feet: ${State.variables.player.inventory.currentlyEquipped.feet.name}\n\n`);

    new Wikifier(place, `Weapons: ${State.variables.player.inventory.currentlyEquipped.weapons.name}`);
  },
  init() { },
};

macros.addItemToInventoryHelper = {
  /* eslint-disable-next-line */
   handler(place, macroName, params, parser) {
    addItemToInventory(params[0]);
  },
  init() { },
};

let addItemToInventory = (item) => {
  const newItem = item;
  let id = -1;
  switch (item.slot) {
    case 'head':
      id = State.variables.player.inventory.backpack.head.length;
      newItem.id = id;
      State.variables.player.inventory.backpack.head.push(newItem);
      break;
    case 'chest':
      id = State.variables.player.inventory.backpack.chest.length;
      newItem.id = id;
      State.variables.player.inventory.backpack.chest.push(newItem);
      break;
    case 'legs':
      id = State.variables.player.inventory.backpack.legs.length;
      newItem.id = id;
      State.variables.player.inventory.backpack.legs.push(newItem);
      break;
    case 'feet':
      id = State.variables.player.inventory.backpack.feet.length;
      newItem.id = id;
      State.variables.player.inventory.backpack.feet.push(newItem);
      break;
    case 'weapons':
      id = State.variables.player.inventory.backpack.weapons.length;
      newItem.id = id;
      State.variables.player.inventory.backpack.weapons.push(newItem);
      break;
    case 'general':
    default:
      id = State.variables.player.inventory.backpack.general.length;
      newItem.id = id;
      State.variables.player.inventory.backpack.general.push(newItem);
      break;
  }
};
