State.variables.guildRelations = {
    "merchantsGuild": {
        currentProgress: 0,
        maxProgress: 100
    },
    "adventurersGuild": {
        currentProgress: 0,
        maxProgress: 100
    },
    "thievesGuild": {
        currentProgress: 0,
        maxProgress: 100
    },
    "scienceGuild": {
        currentProgress: 0,
        maxProgress: 100
    },
    "churchGuild": {
        currentProgress: 0,
        maxProgress: 100
    }
}

macros.relationships = {
    /* eslint-disable-next-line */
    handler(place, macroName, params, parser) {
      Dialog.setup('Relations');
      Dialog.wiki(Story.get('Relations').processText());
      Dialog.open();
    },
    init() { },
  };