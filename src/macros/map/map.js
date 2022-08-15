macros.map = {
    /* eslint-disable-next-line */
    handler(place, macroName, params, parser) {
      Dialog.setup('Map');
      Dialog.wiki(Story.get('Map').processText());
      Dialog.open();
    },
    init() { },
  };