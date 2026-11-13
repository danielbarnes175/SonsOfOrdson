macros.journal = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    Dialog.setup('Journal');
    Dialog.wiki(Story.get('Journal').processText());
    Dialog.open();
  },
  init() { },
};

macros.getQuestListInJournal = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    new Wikifier(place, "''Active Quests''\n");
    setup.getQuestsByStatus(setup.questStatuses.active).forEach((questId) => {
      const definition = setup.getDefinition('quests', questId);
      const objective = setup.getQuestObjective(questId);
      new Wikifier(place, `${definition.title} - ${objective.description}\n`);
    });

    new Wikifier(place, "\n''Available Quests''\n");
    setup.getQuestsByStatus(setup.questStatuses.available).forEach((questId) => {
      const definition = setup.getDefinition('quests', questId);
      new Wikifier(place, `${definition.title} - ${definition.hint}\n`);
    });

    new Wikifier(place, "\n''Completed Quests''\n");
    setup.getQuestsByStatus(setup.questStatuses.completed).forEach((questId) => {
      const definition = setup.getDefinition('quests', questId);
      const quest = setup.getQuestState(questId);
      const rewardStatus = quest.rewardClaimed ? '' : ' - Reward available';
      new Wikifier(place, `${definition.title}${rewardStatus}\n`);
    });

    new Wikifier(place, "\n''Failed Quests''\n");
    setup.getQuestsByStatus(setup.questStatuses.failed).forEach((questId) => {
      new Wikifier(place, `${setup.getDefinition('quests', questId).title}\n`);
    });
  },
  init() { },
};
