setup.registerDefinitions('guilds', {
  merchantsGuild: {
    maxProgress: 100,
  },
  adventurersGuild: {
    maxProgress: 100,
  },
  thievesGuild: {
    maxProgress: 100,
  },
  ordTechGuild: {
    maxProgress: 100,
  },
  churchGuild: {
    maxProgress: 100,
  },
});

State.variables.guilds = {};
Object.keys(setup.data.guilds).forEach((guildId) => {
  State.variables.guilds[guildId] = {
    currentProgress: 0,
    isPlayerMemberOf: false,
  };
});

setup.registerDefinitions('exams', {
  ordTechEntrance: {
    questions: [
      {
        question: 'What is the first element of the periodic table?',
        choices: [
          'Hydrogen',
          'Oxygen',
          'Beryllium',
          'None of the above',
        ],
        correctAnswerIndex: 0,
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
      },
    ],
  },
});

State.variables.ordTech = {
  smarts: 0,
  entranceExamAnswers: [-1, -1, -1, -1, -1],
  entranceExamScore: 0,
};

setup.ensureOrdTechState = () => {
  const exam = setup.getDefinition('exams', 'ordTechEntrance');
  const ordTech = State.variables.ordTech || {};
  const legacyExam = Array.isArray(ordTech.entranceExam) ? ordTech.entranceExam : [];
  const savedAnswers = Array.isArray(ordTech.entranceExamAnswers)
    ? ordTech.entranceExamAnswers
    : legacyExam.map((question) => question.selectedAnswerIndex);
  const entranceExamAnswers = exam.questions.map((question, index) => {
    const answer = savedAnswers[index];
    const isValidAnswer = Number.isInteger(answer)
      && answer >= -1
      && answer < question.choices.length;
    return isValidAnswer ? answer : -1;
  });

  State.variables.ordTech = {
    smarts: Number.isFinite(ordTech.smarts) ? ordTech.smarts : 0,
    entranceExamAnswers,
    entranceExamScore: Number.isFinite(ordTech.entranceExamScore)
      ? ordTech.entranceExamScore
      : 0,
  };
  return State.variables.ordTech;
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
    const exam = setup.getDefinition('exams', 'ordTechEntrance');
    setup.ensureOrdTechState();
    exam.questions.forEach((question, i) => {
      new Wikifier(place, `${question.question}\n`);
      question.choices.forEach((choice, choiceIndex) => {
        new Wikifier(
          place,
          `<<radiobutton "$ordTech.entranceExamAnswers[${i}]" ${choiceIndex}>> ${choice}\n`,
        );
      });
      new Wikifier(place, '<hr>');
    });
  },
  init() { },
};

macros.getEntranceExamScore = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    let correctAnswers = 0;
    const exam = setup.getDefinition('exams', 'ordTechEntrance');
    const ordTech = setup.ensureOrdTechState();
    exam.questions.forEach((question, index) => {
      if (ordTech.entranceExamAnswers[index] === question.correctAnswerIndex) {
        correctAnswers += 1;
      }
    });

    const examPercentage = correctAnswers / exam.questions.length;
    State.variables.ordTech.entranceExamScore = examPercentage;
    new Wikifier(place, `${examPercentage * 100}`);
  },
  init() { },
};
