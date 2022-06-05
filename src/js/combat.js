macros.setupEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    let player = params[0];
    for (let i = 0; i < params.length; i++) {
      if (i == 0) continue;
      
      new Wikifier(place, `A ${params[i].name} appears before you.\n`);
    }

    getPlayerActions(player, place);
    new Wikifier(place, '<<link "Attack">><<attack>><</link>>\n');
  },
  init() { },
}

macros.progressEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    
  },
  init() { },
}

macros.endEncounter = {
  /* eslint-disable-next-line */
  handler(place, macroName, params, parser) {
    
  },
  init() { },
}

let getPlayerActions = (player, place) => {
    new Wikifier(place, 'What would you like to do?\n');

    new Wikifier(place, `<<radiobutton "$pie" "blueberry" autocheck>>`)
}