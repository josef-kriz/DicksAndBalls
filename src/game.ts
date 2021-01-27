import { Card, sameCards, Suit, getUnshuffledDeck } from './models/card'
import { Opponent, Player } from './models/player'
import { GameStateMessage, GameUpdateMessage, PlayerUpdateMessage, TextMessage } from './models/message'
import {
  isCardPlayedAction,
  isDrawAction,
  isSkippingTurnAction,
  PlayerAction
} from './models/playerAction'
import { GameMessage } from './models/gameMessage'

export class Game {
  private active = false
  private deck: Card[] = getUnshuffledDeck()
  private playedCards: Card[] = []
  private players: Player[] = []
  private playerOnTurn = 0

  private drawCount = 0 // keeps track of how many cards to draw when seven is played
  private skippingNextPlayer = false // keeps track whether the next player should skip a turn (if an ace is played)
  private changeColorTo?: Suit

  public getPlayersCount(): number {
    return this.players.length
  }

  public getGameStateMessage(): GameStateMessage {
    const {active} = this
    return {
      type: 'game_state',
      active,
      players: this.getOpponents(),
    }
  }

  public getGameUpdateMessage(message?: TextMessage[], broughtBackToGame?: string, drewCards = 0): GameUpdateMessage {
    if (!message) message = [{
      translationId: 'Messages.game_started',
    }, {
      translationId: 'Messages.players_turn',
      values: {
        value1: this.players[this.playerOnTurn].name,
      },
    }]

    return {
      type: 'game_update',
      deckTop: this.playedCards,
      message,
      cardsInDeck: this.deck.length > 3 ? '3+' : `${this.deck.length}`,
      playerOnTurn: this.players[this.playerOnTurn].name,
      colorChangedTo: this.changeColorTo,
      skippingNextPlayer: this.skippingNextPlayer,
      broughtBackToGame,
      drewCards,
      shouldDraw: this.drawCount,
    }
  }

  public getPlayerMessage(playerId: string): PlayerUpdateMessage {
    const player = this.players.find((searchedPlayer) => searchedPlayer.id === playerId)
    if (!player) throw new Error('Messages.game_error_player_not_found')

    return {
      type: 'player_update',
      cards: player.cards,
      place: player.place,
      loser: player.loser,
    }
  }

  public getAllPlayerMessages(): { playerId: string; message: PlayerUpdateMessage }[] {
    return this.players.map((player) => ({
      playerId: player.id,
      message: this.getPlayerMessage(player.id),
    }))
  }

  public addPlayer(newPlayer: Player): void {
    this.validatePlayersName(newPlayer.name)

    this.players.push(newPlayer)
    console.log('# Player added: ', newPlayer)
  }

  public removePlayer(playerId: string): void {
    const playerIndex = this.players.findIndex((player) => player.id === playerId)
    if (playerIndex !== -1) {
      console.log('# Player removed:', this.players[playerIndex])
      // stop the game if there are less that 2 players or the player was in game (his cards would be lost)
      if (this.active && (this.players[playerIndex].cards.length > 0 || (this.players.length - this.getWaitingPlayersCount()) < 2)) this.stopGame()
      this.players.splice(playerIndex, 1)
      if (playerIndex < this.playerOnTurn) this.playerOnTurn--
    }
  }

  /**
   * Starts the game: shuffles the deck, distributes the cards, sets the game to active
   * Optional parameter for the player who shuffled the cards
   * @param playerId
   */
  public startGame(playerId?: string): void {
    if (this.active) throw new Error('Messages.game_error_game_already_started')
    if (this.players.length < 2) throw new Error('Messages.game_error_not_enough_players')
    if (this.players.length > 7) throw new Error('Messages.game_error_too_many_players')

    // find the player on turn that starts the game
    const shufflingPlayerIndex = this.players.findIndex((player => player.id === playerId))
    if (shufflingPlayerIndex !== -1 && this.players[shufflingPlayerIndex + 1]) {
      this.playerOnTurn = shufflingPlayerIndex + 1
    } else this.playerOnTurn = 0

    // reset winners and losers
    for (const player of this.players) {
      player.place = 0
      player.canBeBroughtBack = false
      player.loser = false
    }

    this.shuffle()
    this.distributeCardsToPlayers()
    this.playedCards = [this.deck[0]]
    this.deck.splice(0, 1)

    this.drawCount = this.playedCards[0].value === '7' ? 2 : 0
    this.skippingNextPlayer = this.playedCards[0].value === 'Ace'
    this.changeColorTo = undefined

    this.active = true
    console.log('# Game started!')
    this.logGame()
  }

  public stopGame(): void {
    console.log('# Game stopped!')
    this.active = false
  }

  /**
   * This is the core function that handles player's turn
   * @param playerId
   * @param action
   */
  public handlePlayersTurn(playerId: string, action: PlayerAction): GameMessage {
    // first check if all the required parameters were sent and are correct
    const player = this.players.find((player => player.id === playerId))
    if (!player) throw new Error('Messages.game_error_player_not_found')
    if (!this.active && !(isCardPlayedAction(action) && action.card.value === '7' && action.card.suit === 'Heart')) throw new Error('Messages.game_error_game_over')
    if (playerId !== this.players[this.playerOnTurn].id) throw new Error('Messages.game_error_not_your_turn')

    // values that we could send to the player are stored here
    const message: TextMessage[] = []
    let returnedPlayer: Player | undefined
    let drewCards = 0

    this.isValidMove(action)

    // do different things based on the type of player's action
    if (isCardPlayedAction(action)) {
      const playersCardIndex = player.cards.findIndex(card => sameCards(card, action.card))
      if (playersCardIndex === -1) throw new Error('Messages.game_error_card_missing')
      if (action.card.value === 'Queen' && !action.changeColorTo) throw new Error('Messages.game_error_color_missing')

      this.playedCards.unshift(action.card)
      player.cards.splice(playersCardIndex, 1)
      this.changeColorTo = undefined

      message.push({
        translationId: 'Messages.player_played_card',
        values: {
          value1: player.name,
          value2: {
            translationId: `Card.${action.card.suit}.${action.card.value}.accusative`,
          },
        },
      })

      if (action.card.value === '7') {
        if (action.card.suit === 'Heart') returnedPlayer = this.check7ofHeartsRule()
        if (returnedPlayer) message.push({
          translationId: 'Messages.player_brought_back_to_game',
          values: {
            value1: returnedPlayer.name,
          },
        })
        else this.drawCount += 2
      } else if (action.card.value === 'Ace') this.skippingNextPlayer = true
      else if (action.card.value === 'Queen' && action.changeColorTo) {
        this.changeColorTo = action.changeColorTo
        message.push({
          translationId: 'Messages.player_changed_color',
          values: {
            value1: {
              translationId: this.getTranslationForSuit(action.changeColorTo),
            },
          },
        })
      }

      console.log(`# Action: Player ${playerId} played ${action.card.suit} ${action.card.value}`)

      if (player.cards.length === 0) {
        player.place = this.getWinnersCount() + 1
        player.canBeBroughtBack = true
        message.push({
          translationId: 'Messages.player_won',
        })
      }
    } else if (isDrawAction(action)) {
      if (this.drawCount > 0) {
        message.push({
          translationId: 'Messages.player_drew_cards',
          values: {
            value1: player.name,
            value2: `${this.drawCount}`,
          },
        })
        for (let i = 0; i < this.drawCount; i++) this.drawCard(player)
        drewCards = this.drawCount
        this.drawCount = 0
      } else {
        message.push({
          translationId: 'Messages.player_drew_card',
          values: {
            value1: player.name,
          },
        })
        drewCards++
        this.drawCard(player)
      }
      console.log(`# Action: Player ${playerId} drew a card`)
    } else if (isSkippingTurnAction(action)) {
      this.skippingNextPlayer = false
      message.push({
        translationId: 'Messages.player_skipped_turn',
        values: {
          value1: player.name,
        },
      })
      console.log(`# Action: Player ${playerId} skipped a turn`)
    } else throw new Error('Messages.game_error_unknown_action')

    this.changePlayerOnTurn()
    if (returnedPlayer) this.changePlayerOnTurn()

    if (this.active) {
      // if the last message is not one of those that end with an exclamation mark, add '.'
      if (!['Messages.player_won'].includes(message[message.length - 1].translationId)) message.push({translationId: '.'})
      message.push({
        translationId: 'Messages.players_turn',
        values: {
          value1: this.players[this.playerOnTurn].name,
        },
      })
    }

    this.logGame()

    const response: GameMessage = {
      gameState: this.getGameStateMessage(),
      gameUpdate: this.getGameUpdateMessage(message, returnedPlayer && returnedPlayer.name, drewCards),
      players: [{
        player: playerId,
        playerUpdate: this.getPlayerMessage(playerId),
      }],
    }
    // if a player was brought back to the game with 7 of hearts
    if (returnedPlayer) response.players.push({
      player: returnedPlayer.id,
      playerUpdate: this.getPlayerMessage(returnedPlayer.id),
    })
    // if the game stopped (because somebody lost) find the loser and send him a message too
    if (!this.active) response.players.push({
      player: this.players[this.playerOnTurn].id,
      playerUpdate: this.getPlayerMessage(this.players[this.playerOnTurn].id),
    })

    return response
  }

  private validatePlayersName(name: string): void | never {
    if (!name) throw new Error('Messages.table_error_empty_name')
    const lowCaseTrimmedName = name.toLowerCase().trim()
    for (const player of this.players) {
      if (player.name.toLowerCase().trim() === lowCaseTrimmedName) throw new Error('Messages.table_error_player_exists')
    }
    if (lowCaseTrimmedName.length > 50) throw new Error('Messages.table_error_player_name_too_long')
    if (lowCaseTrimmedName.length === 0) throw new Error('Messages.table_error_invalid_player_name')
  }

  /**
   * The 7 of hearts rule: When this card is played, it can revive a player that has already won
   * if the revived player won in the last round
   */
  private check7ofHeartsRule(): Player | undefined {
    // gets the next player, even if he's a winner
    const getNextPlayer = (fromPlayer: Player): Player => {
      const playerIndex = this.players.indexOf(fromPlayer)
      return playerIndex + 1 >= this.players.length ? this.players[0] : this.players[playerIndex + 1]
    }
    let nextPlayer = getNextPlayer(this.players[this.playerOnTurn])

    // loop through all the winners playing after the player on turn
    while (nextPlayer.place > 0) {
      if (nextPlayer.canBeBroughtBack) {
        this.players[this.playerOnTurn].loser = false
        nextPlayer.place = 0
        for (const player of this.players) if (player.place > 0 && player.canBeBroughtBack) player.place--
        nextPlayer.canBeBroughtBack = false
        for (let i = 0; i < this.drawCount + 2; i++) this.drawCard(nextPlayer)
        this.drawCount = 0
        if (this.players[this.playerOnTurn].cards.length !== 0) this.active = true
        return nextPlayer
      }
      nextPlayer = getNextPlayer(nextPlayer)
    }
  }

  private drawCard(player: Player): void {
    // Check if there are cards left in the deck. If not, create the deck from the deck of played cards
    if (this.deck.length === 0) {
      if (this.playedCards.length === 1) throw new Error('Messages.game_error_out_of_cards')
      console.log('# The deck was refilled')
      this.deck = [...(this.playedCards.slice(1))]
      this.playedCards = [this.playedCards[0]]
    }
    const card = this.deck.pop()
    if (!card) throw new Error('Messages.game_error_cant_draw')
    player.cards.push(card)
  }

  private getWinnersCount(): number {
    return this.players.reduce((winnersCount, player) => winnersCount + (player.place > 0 ? 1 : 0), 0)
  }

  private getWaitingPlayersCount(): number {
    const isWaiting = (player: Player): boolean => player.place === 0 && !player.loser && player.cards.length === 0
    return this.players.reduce((waitingCount, player) => waitingCount + (isWaiting(player) ? 1 : 0), 0)
  }

  private changePlayerOnTurn(): void {
    this.nextNonWinner()

    // detect if the player lost (he's the only "non-winner")
    if (this.getWinnersCount() + this.getWaitingPlayersCount() === this.players.length - 1) {
      this.players[this.playerOnTurn].loser = true
      this.stopGame()
    }
  }

  /**
   * Change the playerOnTurn property to next player that had not won yet
   */
  private nextNonWinner(): void {
    for (let i = 0; i < this.players.length; i++) {
      this.playerOnTurn++
      if (this.playerOnTurn >= this.players.length) this.playerOnTurn = 0
      const player = this.players[this.playerOnTurn]
      if (player.place === 0 && player.cards.length > 0) break
      else player.canBeBroughtBack = false
    }
  }

  /**
   * Shuffle the deck using the Fisher–Yates algorithm
   */
  private shuffle(): void {
    this.deck = getUnshuffledDeck()
    let currentIndex = this.deck.length, temporaryValue, randomIndex

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1

      temporaryValue = this.deck[currentIndex]
      this.deck[currentIndex] = this.deck[randomIndex]
      this.deck[randomIndex] = temporaryValue
    }
    console.log('# Deck shuffled')
  }

  /**
   * Returns the list of players where cards are substituted by their count
   */
  private getOpponents(): Opponent[] {
    return this.players.map((player) => ({
      name: player.name,
      cards: player.cards.length,
      place: player.place,
      loser: player.loser,
    }))
  }

  /**
   * Distribute cards to players when the game is initialized
   * Every player gets four cards
   */
  private distributeCardsToPlayers(): void {
    for (const player of this.players) {
      player.cards = []
      player.cards.splice(0, 0, ...this.deck.slice(0, 4))
      this.deck.splice(0, 4)
    }
    console.log('# Cards distributed to players', this.players, this.deck)
  }

  /**
   * Checks whether the move is valid. Throws an error if not
   * @param action
   */
  private isValidMove(action: PlayerAction): void | never {
    if (isCardPlayedAction(action)) {
      if (this.changeColorTo && action.card.value !== 'Queen') {
        if (action.card.suit !== this.changeColorTo) {
          switch (this.changeColorTo) {
            case 'Ball':
              throw new Error('Messages.color_changed_to_balls')
            case 'Dick':
              throw new Error('Messages.color_changed_to_dicks')
            case 'Green':
              throw new Error('Messages.color_changed_to_greens')
            case 'Heart':
              throw new Error('Messages.color_changed_to_hearts')
          }
        }
      } else if (this.skippingNextPlayer && action.card.value !== 'Ace') throw new Error('Messages.game_error_cant_play_when_skipping')
      else if (this.drawCount > 0 && action.card.value !== '7') throw new Error('Messages.game_error_cant_play_when_drawing')
      else if (this.playedCards[0].suit !== action.card.suit && this.playedCards[0].value !== action.card.value && action.card.value !== 'Queen') throw new Error('Messages.game_error_invalid_move')
    } else if (isDrawAction(action)) {
      if (this.skippingNextPlayer) throw new Error('Messages.game_error_cant_draw_when_skipping')
    } else if (isSkippingTurnAction(action)) {
      if (!this.skippingNextPlayer) {
        if (this.playedCards[0].value === 'Ace') throw new Error('Messages.game_error_turn_already_skipped')
        else throw new Error('Messages.game_error_cant_skip')
      }
    } else throw new Error('Messages.game_error_unknown_action')
  }

  private logGame(): void {
    console.log(`#Move: on turn: ${this.players[this.playerOnTurn].name}`, `drawCount: ${this.drawCount}`, `skippingTurn: ${this.skippingNextPlayer}`, this.players, this.deck, this.playedCards)
  }

  // noinspection JSMethodCanBeStatic
  private getTranslationForSuit(suit: Suit): string {
    switch (suit) {
      case 'Heart':
        return 'Game.hearts'
      case 'Green':
        return 'Game.greens'
      case 'Dick':
        return 'Game.dicks'
      case 'Ball':
        return 'Game.balls'
    }
  }
}
