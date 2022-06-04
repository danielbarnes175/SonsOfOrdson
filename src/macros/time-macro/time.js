let currentDay = 1;
let currentHour = 8;
let currentMinute = 0;

macros.getTimeString = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    new Wikifier(place, `Day ${currentDay} - ${currentHour}:${currentMinute < 10 ? '0' : ''}${currentMinute}`);
  },
  init() { },
};

macros.incrementTime = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    currentHour += params[0];
    currentMinute += params[1];

    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute -= 60;
    }
    if (currentHour >= 24) {
      currentDay += 1;
      currentHour -= 24;
    }
  },
  init() { },
};
