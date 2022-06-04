 var currentDay = 1;
 var currentHour = 8;
 var currentMinute = 0;

 macros['getTimeString'] = {
    handler: function(place, macroName, params, parser) {
      new Wikifier(place, `Day ${currentDay} - ${currentHour}:${currentMinute<10?'0':''}${currentMinute}`);
    },
    init: function() { },
  };

macros['incrementTime'] = {
    handler: function(place, macroName, params, parser) {
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
      init: function() { },
}