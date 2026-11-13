setup.registerDefinitions('shops', {
  chemicalImbalance: {
    displayName: 'Chemical Imbalance',
    maxProgress: 100,
    shiftPay: 5,
    rivals: ['linenDreams', 'greenRaven'],
    catalog: [],
    acceptedItemTypes: [],
  },
  greenRaven: {
    displayName: 'Green Raven',
    maxProgress: 100,
    shiftPay: 5,
    rivals: ['chemicalImbalance', 'linenDreams'],
    catalog: [],
    acceptedItemTypes: [],
  },
  linenDreams: {
    displayName: 'Linen Dreams',
    maxProgress: 100,
    shiftPay: 5,
    rivals: ['chemicalImbalance', 'greenRaven'],
    catalog: [],
    acceptedItemTypes: [],
  },
  generalMetalworks: {
    displayName: 'General Metalworks',
    maxProgress: 100,
    rivals: [],
    catalog: [
      'dagger',
      'ironHelmet',
      'ironChestplate',
      'ironPlatelegs',
      'ironBoots',
    ],
    acceptedItemTypes: ['melee', 'armor'],
    pricing: {
      maximumBuyDiscount: 0.2,
      maximumSellRate: 0.7,
      minimumSellRate: 0.5,
    },
  },
  bubbleAndBroil: {
    displayName: 'Bubble and Broil',
    maxProgress: 100,
    rivals: [],
    catalog: ['healthPotion'],
    acceptedItemTypes: ['consumable'],
    pricing: {
      maximumBuyDiscount: 0.2,
      maximumSellRate: 0.7,
      minimumSellRate: 0.5,
    },
  },
});

State.variables.shopRelations = {};
Object.keys(setup.data.shops).forEach((shopId) => {
  State.variables.shopRelations[shopId] = {
    currentProgress: 0,
    isPlayerHired: false,
  };
});

setup.createEmptyShopSession = () => ({
  lastMessage: '',
  returnPassage: null,
  shopId: null,
});

State.variables.shopSession = setup.createEmptyShopSession();

setup.getShopDefinition = (shopId) => setup.getDefinition('shops', shopId);

setup.getShopRelation = (shopId) => State.variables.shopRelations[shopId] || null;

setup.getShopCatalog = (shopId) => {
  const definition = setup.getShopDefinition(shopId);
  return definition ? definition.catalog : [];
};

setup.getShopProgressRatio = (shopId) => {
  const definition = setup.getShopDefinition(shopId);
  const relation = setup.getShopRelation(shopId);
  if (!definition || !relation) return 0;
  return Math.min(1, Math.max(0, relation.currentProgress / definition.maxProgress));
};

setup.getShopBuyPrice = (shopId, itemId) => {
  const shop = setup.getShopDefinition(shopId);
  const item = setup.getDefinition('items', itemId);
  if (!shop || !item || !shop.catalog.includes(itemId) || item.inventoryItem === false) {
    return null;
  }

  const discount = setup.getShopProgressRatio(shopId)
    * shop.pricing.maximumBuyDiscount;
  return Math.max(1, Math.ceil(item.value * (1 - discount)));
};

setup.canShopBuyItem = (shopId, item) => {
  const shop = setup.getShopDefinition(shopId);
  const definitionId = typeof item === 'string'
    ? item
    : item && (item.definitionId || item.id);
  const definition = setup.getDefinition('items', definitionId);
  return Boolean(
    shop
    && definition
    && definition.inventoryItem !== false
    && shop.acceptedItemTypes.includes(definition.type),
  );
};

setup.getShopSellPrice = (shopId, itemId) => {
  const shop = setup.getShopDefinition(shopId);
  const item = setup.getDefinition('items', itemId);
  if (!shop || !item || !setup.canShopBuyItem(shopId, item)) return null;

  const progressRatio = setup.getShopProgressRatio(shopId);
  const sellRateRange = shop.pricing.maximumSellRate - shop.pricing.minimumSellRate;
  const sellRate = shop.pricing.minimumSellRate + progressRatio * sellRateRange;
  return Math.max(1, Math.floor(item.value * sellRate));
};

setup.isItemEquipped = (itemId) => (
  Object.values(State.variables.player.inventory.currentlyEquipped).includes(itemId)
);

setup.getShopSellableItems = (shopId) => setup.getInventoryItems()
  .filter((item) => setup.canShopBuyItem(shopId, item));

setup.openShop = (shopId, returnPassage) => {
  const definition = setup.getShopDefinition(shopId);
  if (!definition || definition.catalog.length === 0) {
    return { success: false, reason: 'That shop is not available.' };
  }

  State.variables.shopSession = {
    lastMessage: '',
    returnPassage: returnPassage || State.variables.player.location,
    shopId,
  };
  return { success: true, definition };
};

setup.closeShop = () => {
  State.variables.shopSession = setup.createEmptyShopSession();
  return { success: true };
};

setup.adjustShopProgress = (shopId, amount) => {
  const definition = setup.getShopDefinition(shopId);
  const relation = setup.getShopRelation(shopId);
  if (!definition || !relation || !Number.isFinite(amount)) {
    return { success: false, reason: 'Invalid shop relationship adjustment.' };
  }

  relation.currentProgress = Math.min(
    definition.maxProgress,
    Math.max(0, relation.currentProgress + amount),
  );
  return { success: true, currentProgress: relation.currentProgress };
};

setup.buyFromShop = (shopId, itemId, quantity = 1) => {
  const shop = setup.getShopDefinition(shopId);
  const item = setup.getDefinition('items', itemId);
  if (!shop) return { success: false, reason: 'Shop was not found.' };
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { success: false, reason: 'Purchase quantity must be a positive integer.' };
  }
  if (!item || item.inventoryItem === false || !shop.catalog.includes(itemId)) {
    return { success: false, reason: 'That item is not sold here.' };
  }

  const unitPrice = setup.getShopBuyPrice(shopId, itemId);
  const totalPrice = unitPrice * quantity;
  if (State.variables.player.gold < totalPrice) {
    return { success: false, reason: `You need ${totalPrice} gold for that purchase.` };
  }

  setup.addItemToInventory(itemId, quantity);
  State.variables.player.gold -= totalPrice;
  return {
    success: true,
    itemId,
    quantity,
    totalPrice,
    unitPrice,
  };
};

setup.sellToShop = (shopId, itemInstanceId, quantity = 1) => {
  const shop = setup.getShopDefinition(shopId);
  const item = setup.getInventoryItemById(itemInstanceId);
  if (!shop) return { success: false, reason: 'Shop was not found.' };
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { success: false, reason: 'Sale quantity must be a positive integer.' };
  }
  if (!item) return { success: false, reason: 'Item was not found.' };

  const definition = setup.getItemDefinition(item);
  if (!setup.canShopBuyItem(shopId, item)) {
    return { success: false, reason: `${shop.displayName} will not buy that item.` };
  }
  if (setup.isItemEquipped(item.id)) {
    return { success: false, reason: 'Unequip that item before selling it.' };
  }
  if (quantity > (item.quantity || 1)) {
    return { success: false, reason: 'You do not own that many items.' };
  }

  const unitPrice = setup.getShopSellPrice(shopId, definition.id);
  const totalPrice = unitPrice * quantity;
  const removal = setup.removeItemFromInventory(item.id, quantity);
  if (!removal.success) return removal;

  State.variables.player.gold += totalPrice;
  return {
    success: true,
    itemId: definition.id,
    quantity,
    totalPrice,
    unitPrice,
  };
};

setup.getShopTransactionMessage = (result, transactionType) => {
  if (!result.success) return result.reason;
  const definition = setup.getDefinition('items', result.itemId);
  const verb = transactionType === 'buy' ? 'Bought' : 'Sold';
  return `${verb} ${result.quantity} × ${definition.name} for ${result.totalPrice} gold.`;
};

setup.setShopSessionMessage = (message) => {
  State.variables.shopSession.lastMessage = message;
};

setup.workForShop = (shopId) => {
  const definition = setup.getShopDefinition(shopId);
  if (!definition || !definition.shiftPay) {
    return { success: false, reason: 'That shop does not offer shifts.' };
  }

  setup.adjustShopProgress(shopId, 1);
  definition.rivals.forEach((rivalId) => setup.adjustShopProgress(rivalId, -1));
  State.variables.player.gold += definition.shiftPay;
  return { success: true, pay: definition.shiftPay };
};

macros.openShop = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const result = setup.openShop(params[0], params[1]);
    if (!result.success) new Wikifier(place, result.reason);
  },
  init() { },
};

macros.closeShop = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.closeShop();
  },
  init() { },
};

macros.buyFromShop = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const { shopId } = State.variables.shopSession;
    const result = setup.buyFromShop(shopId, params[0], params[1] || 1);
    setup.setShopSessionMessage(setup.getShopTransactionMessage(result, 'buy'));
  },
  init() { },
};

macros.sellToShop = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const { shopId } = State.variables.shopSession;
    const result = setup.sellToShop(shopId, params[0], params[1] || 1);
    setup.setShopSessionMessage(setup.getShopTransactionMessage(result, 'sell'));
  },
  init() { },
};

setup.renderWorkResult = (place, result) => {
  if (!result.success) {
    new Wikifier(place, result.reason);
    return;
  }
  new Wikifier(place, `You have received ${result.pay} gold as payment for your shift.`);
};

macros.workForChemicalImbalance = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.renderWorkResult(place, setup.workForShop('chemicalImbalance'));
  },
  init() { },
};

macros.workForGreenRaven = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.renderWorkResult(place, setup.workForShop('greenRaven'));
  },
  init() { },
};

macros.workForLinenDreams = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    setup.renderWorkResult(place, setup.workForShop('linenDreams'));
  },
  init() { },
};
