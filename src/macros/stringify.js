macros.getJsonString = {
  /* eslint-disable-next-line */
    handler(place, macroName, params, parser) {
    params.forEach((element) => {
      new Wikifier(place, JSON.stringify(element));
    });
  },
  init() { },
};
