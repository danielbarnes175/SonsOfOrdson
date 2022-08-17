State.variables.currentDay = 1;
State.variables.currentHour = 8;
State.variables.currentMinute = 0;

macros.getTimeString = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    const { currentDay, currentHour, currentMinute } = State.variables;
    new Wikifier(place, `Day ${currentDay} - ${currentHour}:${currentMinute < 10 ? '0' : ''}${currentMinute}`);
  },
  init() { },
};

macros.incrementTime = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    State.variables.currentHour += params[0];
    State.variables.currentMinute += params[1];

    if (State.variables.currentMinute >= 60) {
      State.variables.currentHour += 1;
      State.variables.currentMinute -= 60;
    }
    if (State.variables.currentHour >= 24) {
      State.variables.currentDay += 1;
      State.variables.currentHour -= 24;

      State.variables.player.intoxication = 0;
    }
  },
  init() { },
};
