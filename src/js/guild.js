State.variables.guilds = {
  merchantsGuild: {
    currentProgress: 0,
    maxProgress: 100,
    isPlayerMemberOf: false,
  },
  adventurersGuild: {
    currentProgress: 0,
    maxProgress: 100,
    isPlayerMemberOf: false,
  },
  thievesGuild: {
    currentProgress: 0,
    maxProgress: 100,
    isPlayerMemberOf: false,
  },
  scienceGuild: {
    currentProgress: 0,
    maxProgress: 100,
    isPlayerMemberOf: false,
  },
  churchGuild: {
    currentProgress: 0,
    maxProgress: 100,
    isPlayerMemberOf: false,
  },
};

macros.relationships = {
  /* eslint-disable-next-line */
    handler(place, macroName, params, parser) {
    Dialog.setup('Relations');
    Dialog.wiki(Story.get('Relations').processText());
    Dialog.open();
  },
  init() { },
};

macros.joinAdventurersGuild = {
  /* eslint-disable-next-line */
    handler(place, macroName, params, parser) {
    State.variables.player.gold -= 25;
    State.variables.guilds.adventurersGuild.isPlayerMemberOf = true;
  },
  init() { },
};
