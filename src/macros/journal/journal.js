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
      if (value.knownQuest && value.currentStep < value.quest_steps.length - 1) {
        activeQuests.push({
          name: key,
          step: value.quest_steps[value.currentStep],
        });
      } else if (value.knownQuest) {
        completedQuests.push(value.title);
      } else {
        unstartedQuests.push({
          name: value.title,
          hint: value.quest_steps[0],
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
