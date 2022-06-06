# Sons of Ordson

Sons of Ordson is a text based sandbox/adventure game created with Twine and Sugarcube 2. It uses the Twee3 and Tweego to combine .twee, .js, and .css files into a single page application. The game can be played at danielbarnes175.github.io/sonsofordson/

## Current Roadmap

If you're interested in seeing what features are planned, please see the [roadmap](https://github.com/danielbarnes175/SonsOfOrdson/issues/2).

## Contributing

### Non-Code Contributions

If you're interested in creating a quest, you can either directly pull down the code and make a twee file in `src/story/quests`, and then submit a pull request. Or, you can submit the script for the quest (along with any relevant mechanics) as an issue on GitHub.

If you'd like to contribute in other ways, feel free to create an issue explaining what you want to contribute, or reach out to me directly. Art, writing, and even feature requests/suggestions are all appreciated.

### Code Contributions

#### ***Prerequisites***

- [Git](https://git-scm.com/downloads), and a terminal such as Git Bash (Can be installed when installing Git)
- [NodeJS](https://nodejs.org/en/)  
- A text editor, such as [VSCode](https://code.visualstudio.com/)  
    - If using VSCode, it is helpful to install the [Twee 3 Language Tools Plugin](https://marketplace.visualstudio.com/items?itemName=cyrusfirheir.twee3-language-tools)
- [TweeGo](https://www.motoslave.net/tweego/)

#### ***Setup***

Create a fork of the repository from GitHub. Navigate within your terminal to a directory where you want to hold the source code:

`cd ~/twinegames/`

Git clone your fork of the repo:

`git clone https://github.com/[your username]/SonsOfOrdson.git` then `cd SonsOfOrdson`

Copy the tweego.exe (or other binary depending on OS) into the root directory of the project.

#### ***Build***

`npm run build` will create the `story.html` file, which you can open to test your game. I recommend using the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) plugin for vscode.

- Note: After each change, you must rebuild the game.

#### ***Making Changes***

The majority of code for the project will be in the `/src` directory. Within that directory, you have various subdirectories.

- `story` contains the twee files. Twee files are essentially what a player will see as they play the game.
- `macros` contains macros that are generic or self contained, as well as third party macros that are not custom built for this project in the `macros/vendors` folder.
- `js` for larger scale javascript files incorporating larger systems.
- `twee-configs` if a macro is created, in order for the Twee 3 Language Tools plugin to recognize them, you must create a twee-config for them.
- `images` images that are stored locally.

After your changes have been created, you can create a pull request that will then be reviewed and merged, if applicable.


