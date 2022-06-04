State.variables.quests = {
    questLog: {
        "A certain undergarment": {
            title: "A certain undergarment",
            description: "Apparently the barkeep wants a specific piece of clothing, but he can't quite get it right now...",
            questSteps: [
                'Not yet started',
                'The barkeep wants you to get a specific custom made piece of clothing. You should be able to pick it up at the Silver Patchwork.',
                'You spoke to the tailor at the Silver Patchwork, and they gave you the piece of clothing. You need to take it back to the barkeep',
                'Quest Complete'
            ],
            currentStep: 0,
            knownQuest: false,
            rewards: {
                gold: 10,
                exp: 20
            }
        },
        "test quest": {
            title: "A certain undergarment",
            description: "Test quest",
            quest_steps: [
                'Quest not yet started',
                'Quest Complete'
            ],
            currentStep: 0,
            rewards: {
                gold: 10,
                exp: 20
            }
        }
    },
    rumors: [
        {
            message: "blah",
            quest: "test quest"
        }
    ]
}

macros['receiveQuestReward'] = {
    handler: function(place, macroName, params, parser) {
      new Wikifier(place, `You received....\n`);
      new Wikifier(place, `''Gold:'' ${State.variables.quests.questLog[params[0]].rewards.gold}\n`);
      new Wikifier(place, `''Exp:'' ${State.variables.quests.questLog[params[0]].rewards.exp}\n`);
    },
    init: function() { },
  };