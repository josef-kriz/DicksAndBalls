# Dicks 'n Balls
Dicks and Balls is a traditional czech card game played with 32 cards. This is project is a web application including a ExpressJS web server containing the logic of the game as well as a Angular web client that communicates with the server using web sockets.

Learn more about the game on Wikipedia: https://en.wikipedia.org/wiki/Mau-Mau_(card_game)

_Note: Dicks and Balls is an unofficial translation. The original name is Prší (“it rains”)._

## Installation

To successfully install and run the app just follow these simple steps:
1. Download/Clone this repository
2. Open the terminal and go to the project root and then to the _client_ folder.
3. Install the packages with `yarn install`
4. Run `yarn build --prod`. When the command finishes, there should be a new folder called _www_.
5. Go back to the project root and run `yarn install` there as well.
6. Now run `yarn start`. This will build and start the server that listens on port 3001 by default. Run `yarn start:watch` for automatic server restart on change.

If you'd like to work on the client, start the local web server with `yarn start` in the _client_ folder. The client will run on port 4200 by default.

## Contribution
You're welcome to further extend the project, file issues or send suggestions.
