# Dicks 'n Balls
Dicks and Balls is a traditional czech card game played with 32 cards. This is project is a web application including a ExpressJS web server containing the logic of the game as well as a React web client that communicates with the server using web sockets.

Learn more about the game on Wikipedia: https://en.wikipedia.org/wiki/Mau-Mau_(card_game)

_Note: Dicks and Balls is an unofficial translation. The original name is Prší (“it rains”)._

## Installation

To successfully install and run the app just follow the few simple steps:
1. Download/Clone this repository
2. Open the terminal and go to the project root and then to the _client_ folder.
3. Install the packages with `npm install`
4. Run `npm run build --prod`. When the command finishes, there should be a new folder called _build_.
5. Go back to the project root and run `npm install` there as well.
6. Now run `npm start`. This will build and start the server that listens on port 3001 by default. Run `npm start:watch` for automatic server restart on change.

If you'd like to work on the client, start the local web server with `npm start` in the _client_ folder. If you're running the server on different port than 3001, you also need to change the `proxy` property in client's `package.json` file.

## Contribution
You're welcome to further extend the project, file issues or send suggestions.
