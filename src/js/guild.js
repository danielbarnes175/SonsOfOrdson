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
  ordTechGuild: {
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

State.variables.ordTech = {
  entranceExam: [
    {
      question: 'What is the first element of the periodic table?',
      choices: [
        'Hydrogen',
        'Oxygen',
        'Beryllium',
        'None of the above',
      ],
      correctAnswerIndex: 0,
      selectedAnswerIndex: -1,
    },
    {
      question: '2?',
      choices: [
        'Hydrogen2',
        'Oxygen2',
        'Beryllium2',
        'None of the above2',
      ],
      correctAnswerIndex: 0,
      selectedAnswerIndex: -2,
    },
    {
      question: '3?',
      choices: [
        'Hydrogen3',
        'Oxygen3',
        'Beryllium3',
        'None of the above3',
      ],
      correctAnswerIndex: 0,
      selectedAnswerIndex: -3,
    },
    {
      question: '4?',
      choices: [
        'Hydrogen4',
        'Oxygen4',
        'Beryllium4',
        'None of the above4',
      ],
      correctAnswerIndex: 0,
      selectedAnswerIndex: -4,
    },
    {
      question: '5?',
      choices: [
        'Hydrogen5',
        'Oxygen5',
        'Beryllium5',
        'None of the above5',
      ],
      correctAnswerIndex: 0,
      selectedAnswerIndex: -5,
    },
  ],
  entranceExamScore: 0,
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

macros.getEntranceExamScore = {
  /* eslint-disable-next-line */
    handler(place, macroName, params, parser) {
    let correctAnswers = 0.0;
    let i = 0;
    State.variables.ordTech.entranceExam.forEach((question) => {
      i++;
      if (question.selectedAnswerIndex === question.correctAnswerIndex) correctAnswers += 1;
      console.log(`Question ${i}: ` + question.selectedAnswerIndex);
    });

    console.log(correctAnswers);
    const examPercentage = correctAnswers / State.variables.ordTech.entranceExam.length;
    State.variables.ordTech.entranceExamScore = examPercentage;
    new Wikifier(place, `${examPercentage * 100}`);
  },
  init() { },
};
