import { Component } from '@angular/core';
import { GameService } from './game.service'
import { Opponent } from './models/opponent'
import { Card, Suit } from './models/card'
import {
  isErrorMessage,
  isGameStateMessage,
  isGameUpdateMessage,
  isPlayerUpdateMessage,
  ServerMessage
} from './models/message'
import inactivityDetection from './helpers/inactivityDetection'

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage {
  private error = false
  private playerName?: string
  private participating = false
  private active?: boolean
  private players?: Opponent[]
  private deckTop?: Card[]
  private playerOnTurn?: string
  private cards?: Card[]
  private lastMessage?: {
    error: boolean
    text: string
  }
  private colorChangedTo?: Suit
  private isSkippingTurn = false
  private shouldDraw = 0
  private isWinner = false
  private cardsInDeck?: string

  constructor(private gameService: GameService) { }

  ionViewWillEnter(): void {
    this.gameService.getMessages().subscribe(
        this.handleServerMessage,
        () => this.error = true)
    this.gameService.onDisconnect().subscribe(
        this.handleServerDisconnect
    )
  }

  shouldShowTable(): boolean {
    if (this.error) { return false }
    if (this.active) { return true }
    // if there is a winner/loser among the players show the latest played game
    return this.players.some(player => player.place > 0 || player.loser)
  }

  private handleWin(): void {
    // TODO modal
    const audio = new Audio('/sounds/win31.mp3')
    audio.play().then()
  }

  private handleLoss(): void {
    // TODO modal
    const audio = new Audio('/sounds/sadTrombone.mp3')
    audio.play().then()
  }

  private handleBroughtBackToGame(me: boolean = false): void {
    // if (me) TODO modal
    const audio = new Audio('/sounds/airHorn.mp3')
    audio.play().then()
  }

  private playDrawCardSound(cards: number): void {
    let audioFile: string
    switch (cards) {
      case 4:
        audioFile = '/sounds/crack_the_whip.mp3'
        break
      case 6:
        audioFile = '/sounds/badumtss.mp3'
        break
      case 8:
        audioFile = '/sounds/holy_shit.mp3'
        break
      default:
        return
    }
    const audio = new Audio(audioFile)
    audio.play().then()
  }

  // TODO split to separate handlers by message type
  private updateGameState(message: ServerMessage): void {
    if (isErrorMessage(message)) {
        this.lastMessage = {
          error: true,
          text: message.message
        }
    } else if (isGameStateMessage(message)) {
      const {active, players} = message
      this.active = active
      this.players = players
      this.participating = players.some(player => player.name === this.playerName)
    } else if (isGameUpdateMessage(message)) {
      const {
        players,
        colorChangedTo,
        deckTop,
        playerOnTurn,
        skippingNextPlayer,
        shouldDraw,
        cardsInDeck,
        broughtBackToGame,
        drewCards
      } = message

      if (playerOnTurn === this.playerName && this.active) { inactivityDetection.startDetecting() }
      if (broughtBackToGame) { this.handleBroughtBackToGame(broughtBackToGame === this.playerName) }
      this.playDrawCardSound(drewCards)

      this.players = players // TODO why sent again when already contained in gameStateMessage?
      this.colorChangedTo = colorChangedTo
      this.deckTop = deckTop
      this.playerOnTurn = playerOnTurn
      this.lastMessage = {
        error: false,
        text: message.message,
      }
      this.isSkippingTurn = this.participating && skippingNextPlayer && playerOnTurn === this.playerName
      this.shouldDraw = playerOnTurn === this.playerName ? shouldDraw : 0
      this.cardsInDeck = cardsInDeck
    } else if (isPlayerUpdateMessage(message)) {
      const {cards, place, loser} = message
      if (place > 0) {
        this.handleWin()
      } else if (loser) {
        this.handleLoss()
      }

      this.cards = cards
      this.isWinner = place > 0
    }
  }

  private handleServerDisconnect = (): void => {
    this.participating = false
    this.error = true
  }

  private handleServerMessage = (message: ServerMessage): void => {
    if (this.error) { this.error = false }
    this.updateGameState(message)
  }
}
