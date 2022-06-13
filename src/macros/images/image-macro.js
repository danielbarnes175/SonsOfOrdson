macros.getBannerForLocation = {
  /* eslint-disable-next-line */
    handler(place, macroName, params, parser) {
      console.log(params[0]);
    const imageKey = params[0].toLowerCase().replaceAll(' ', '-');
    const directory = (ENV === 'production') ? 'src/images/' : '../src/images/';

    let time = '';
    if (params[1]) {
      if (currentHour < 12 && currentHour >= 6) {
        time = '-morning';
      } else if (currentHour < 18) {
        time = '-afternoon';
      } else if (currentHour < 22) {
        time = '-evening';
      } else {
        time = '-night';
      }
    }

    const fileType = '.png';
    console.log(imageKey);
    new Wikifier(place, `<img src="${directory}${imageKey}${time}${fileType}" onerror="this.onerror=null; this.src='${directory}default-banner.png'" alt="Image of ${State.variables.player.location}"  width=850 height=300>`);
  },
  init() { },
};

macros.getImage = {
  /* eslint-disable-next-line */
    handler(place, macroName, params, parser) {
    const imageKey = params[0];
    const directory = (ENV === 'production') ? 'src/images/' : '../src/images/';
    const width = params[1];
    const height = params[2];

    new Wikifier(place, `<img src="${directory}${imageKey}" width='${width}' height='${height}'>`);
  },
  init() { },
};
