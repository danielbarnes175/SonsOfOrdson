
 macros['journal'] = {
    handler: function(place, macroName, params, parser) {
        Dialog.setup("Journal");
        Dialog.wiki(Story.get("Journal").processText());
        Dialog.open();
    },
    init: function() { },
  };