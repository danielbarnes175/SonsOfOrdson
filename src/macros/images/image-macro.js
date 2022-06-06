macros.getBannerForLocation = {
    /* eslint-disable-next-line */
    handler(place, macroName, params, parser) {
      const imageKey = params[0].toLowerCase().replace(' ', '-');
      const directory = (ENV === 'production') ? 'src/images/' : '../src/images/';

      let time = '';
      if (params[1]) {
        if (currentHour < 12 && currentHour >= 6) {
            time = '-morning';
        }
        else if (currentHour < 18) {
            time = '-afternoon';
        }
        else if (currentHour < 22) {
            time = '-evening';
        }
        else {
            time = '-night';
        }
      }

      const fileType = '.png';
      new Wikifier(place, `<img src="${directory}${imageKey}${time}${fileType}" width=850 height=300>`);
    },
    init() { },
  };