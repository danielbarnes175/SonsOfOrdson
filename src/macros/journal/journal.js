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
    const activeQuests = [];
    const completedQuests = [];
    const unstartedQuests = [];
    for (const [key, value] of Object.entries(State.variables.quests.questLog)) {
      const definition = setup.getDefinition('quests', key);
      if (value.knownQuest && value.currentStep < definition.steps.length - 1) {
        activeQuests.push({
          name: definition.title,
          step: definition.steps[value.currentStep],
        });
      } else if (value.knownQuest) {
        completedQuests.push(definition.title);
      } else {
        unstartedQuests.push({
          name: definition.title,
          hint: definition.steps[0],
        });
      }
    }

    new Wikifier(place, "''Active Quests''\n");
    activeQuests.forEach((quest) => {
      new Wikifier(place, `${quest.name} - ${quest.step}\n`);
    });

    new Wikifier(place, "''Unstarted Quests''\n");
    unstartedQuests.forEach((quest) => {
      new Wikifier(place, `${quest.name} - ${quest.hint}\n`);
    });

    new Wikifier(place, "''Completed Quests''\n");
    completedQuests.forEach((quest) => {
      new Wikifier(place, `${quest}\n`);
    });
  },
  init() { },
};
