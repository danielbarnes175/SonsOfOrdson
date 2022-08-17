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
  smarts: 0,
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
      question: 'What is the second element of the periodic table?',
      choices: [
        'Calcium',
        'Lithium',
        'Helium',
        'Hydrogen',
      ],
      correctAnswerIndex: 2,
      selectedAnswerIndex: -1,
    },
    {
      question: 'What is the third element of the periodic table?',
      choices: [
        'Lithium',
        'Carbon',
        'Oxygen',
        'Sodium',
      ],
      correctAnswerIndex: 0,
      selectedAnswerIndex: -1,
    },
    {
      question: 'What is the fourth element of the periodic table?',
      choices: [
        'Carbon',
        'Bromine',
        'Beryllium',
        'Boron',
      ],
      correctAnswerIndex: 2,
      selectedAnswerIndex: -1,
    },
    {
      question: 'What is the fifth element of the periodic table?',
      choices: [
        'Carbon',
        'Bromine',
        'Beryllium',
        'Boron',
      ],
      correctAnswerIndex: 3,
      selectedAnswerIndex: -1,
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

macros.getOrdTechEntranceExam = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    State.variables.ordTech.entranceExam.forEach((question, i) => {
      new Wikifier(place, `${question.question}\n`);
      new Wikifier(place, `<<radiobutton "$ordTech.entranceExam[${i}].selectedAnswerIndex" 0>> $ordTech.entranceExam[${i}].choices[0]\n`);
      new Wikifier(place, `<<radiobutton "$ordTech.entranceExam[${i}].selectedAnswerIndex" 1>> $ordTech.entranceExam[${i}].choices[1]\n`);
      new Wikifier(place, `<<radiobutton "$ordTech.entranceExam[${i}].selectedAnswerIndex" 2>> $ordTech.entranceExam[${i}].choices[2]\n`);
      new Wikifier(place, `<<radiobutton "$ordTech.entranceExam[${i}].selectedAnswerIndex" 3>> $ordTech.entranceExam[${i}].choices[3]\n`);
      new Wikifier(place, '<hr>');
    });
  },
  init() { },
};

macros.getEntranceExamScore = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    let correctAnswers = 0;
    Object.keys(State.variables.ordTech.entranceExam).forEach((key) => {
      const question = State.variables.ordTech.entranceExam[key];
      if (question.selectedAnswerIndex === question.correctAnswerIndex) correctAnswers += 1;
    });

    const examPercentage = correctAnswers / 5;
    State.variables.ordTech.entranceExamScore = examPercentage;
    new Wikifier(place, `${examPercentage * 100}`);
  },
  init() { },
};
