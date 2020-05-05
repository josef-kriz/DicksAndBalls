import { Component, HostListener } from '@angular/core'
import { GameService } from './game.service'
import { Opponent } from '../models/opponent'
import { Card, Suit } from '../models/card'
import {
  ErrorMessage,
  GameStateMessage,
  GameUpdateMessage,
  isErrorMessage,
  isGameStateMessage,
  isGameUpdateMessage,
  isPlayerUpdateMessage,
  PlayerUpdateMessage,
  RemovePlayerMessage,
  ServerMessage
} from '../models/message'
import inactivityDetection from './helpers/inactivityDetection'
import { AlertController, MenuController } from '@ionic/angular'
import { SettingsService } from '../settings/settings.service'
import { Title } from '@angular/platform-browser'
import { ComponentCanDeactivate } from './helpers/leaveGameGuard'
import { Observable } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { TableService } from '../services/table.service'
import { MenuService } from '../services/menu.service'
import { ChatService } from '../chat/chat.service'

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements ComponentCanDeactivate {
  tableId: string
  playerName?: string
  participating = false
  active?: boolean
  players?: Opponent[]
  deckTop?: Card[]
  playerOnTurn?: string
  cards?: Card[]
  message?: {
    error: boolean
    text: string
  }
  colorChangedTo?: Suit
  isSkippingTurn = false
  shouldDraw = 0
  isWinner = false
  isLoser = false
  cardsInDeck?: string

  isMenuEnabled = this.menuService.menuEnabled
  unreadChatMessages = this.chatService.unread

  private error = false

  constructor(
    private alertController: AlertController,
    private chatService: ChatService,
    private gameService: GameService,
    private menuController: MenuController,
    private menuService: MenuService,
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    public tableService: TableService,
    private titleService: Title,
  ) {
    const id = this.route.snapshot.paramMap.get('tableId')
    this.tableId = id ?? 'main'
    this.tableService.joinTable(this.tableId)
  }

  // noinspection JSUnusedGlobalSymbols
  ionViewWillEnter(): void {
    this.gameService.getMessages().subscribe(
      this.handleServerMessage,
      () => this.error = true)
    this.gameService.onDisconnect().subscribe(
      this.handleServerDisconnect
    )
  }

  // noinspection JSUnusedGlobalSymbols
  ionViewWillLeave(): void {
    const message: RemovePlayerMessage = {
      type: 'remove_player',
      tableId: this.tableId,
    }
    this.gameService.sendMessage(message)
    this.playerName = undefined
    this.gameService.stop()
  }

  /**
   * Checks whether the user can leave the page
   */
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !(this.participating && !!this.active && !!this.cards && this.cards.length > 0)
  }

  async showMenu(): Promise<void> {
    if (await this.menuController.isEnabled('main-menu')) {
      await this.menuController.open('main-menu')
    } else {
      await this.menuController.enable(true, 'main-menu')
      this.menuService.menuEnabled.next(true)
    }
  }

  async openChat(): Promise<void> {
    await this.menuController.open('chat')
  }

  private handleServerMessage = async (message: ServerMessage): Promise<void> => {
    if (this.error) {
      this.error = false
    }
    if (isErrorMessage(message)) {
      this.handleErrorMessage(message)
    } else if (isGameStateMessage(message)) {
      this.handleGameStateUpdate(message)
    } else if (isGameUpdateMessage(message)) {
      await this.handleGameUpdate(message)
    } else if (isPlayerUpdateMessage(message)) {
      await this.handlePlayerUpdate(message)
    }
  }

  private handleErrorMessage(message: ErrorMessage): void {
    this.message = {
      error: true,
      text: message.message
    }
  }

  private handleGameStateUpdate(message: GameStateMessage): void {
    const {active, players} = message
    this.active = active
    this.players = players
    this.participating = players.some(player => player.name === this.playerName)
    if (this.participating && !this.active) {
      this.message = {
        error: false,
        text: this.players.length >= 2 ? 'Start the game by shuffling the deck' : 'There must be at least two players to start the game',
      }
    }
    if (!active && this.titleService.getTitle().startsWith('*ON TURN*')) {
      this.titleService.setTitle(this.titleService.getTitle().slice(10))
    }
  }

  private async handleGameUpdate(message: GameUpdateMessage): Promise<void> {
    const {
      colorChangedTo,
      deckTop,
      playerOnTurn,
      skippingNextPlayer,
      shouldDraw,
      cardsInDeck,
      broughtBackToGame,
      drewCards
    } = message

    this.colorChangedTo = colorChangedTo
    this.deckTop = deckTop
    this.playerOnTurn = playerOnTurn
    this.message = {
      error: false,
      text: message.message,
    }
    this.isSkippingTurn = this.participating && skippingNextPlayer && playerOnTurn === this.playerName
    this.shouldDraw = playerOnTurn === this.playerName ? shouldDraw : 0
    this.cardsInDeck = cardsInDeck

    if (playerOnTurn === this.playerName && this.active) { // update page title and start inactivity detection (if sounds are allowed)
      this.titleService.setTitle(`*ON TURN* ${this.titleService.getTitle()}`)
      if (await this.settingsService.getSounds()) {
        inactivityDetection.startDetecting()
      }
    } else if (this.titleService.getTitle().startsWith('*ON TURN*')) {
      this.titleService.setTitle(this.titleService.getTitle().slice(10))
    }
    if (playerOnTurn) { // scroll to player's cards (applies only when overflowing)
      const playersEl = document.getElementById('players')
      const playerEl = document.getElementById(playerOnTurn)
      if (playersEl && playersEl.scrollWidth !== playersEl.clientWidth && playerEl) {
        const offset = playerEl.offsetLeft - playersEl.offsetWidth / 2 + playerEl.scrollWidth / 2
        const rangedOffset = Math.min(Math.max(offset, 0), playersEl.scrollWidth - playersEl.offsetWidth)
        playersEl.scrollTo({behavior: 'smooth', left: rangedOffset})
      }
    }
    if (await this.settingsService.getSounds()) {
      await this.playDrawCardSound(drewCards)
    }
    if (broughtBackToGame) {
      await this.handleBroughtBackToGame(broughtBackToGame === this.playerName)
    }
  }

  private async handlePlayerUpdate(message: PlayerUpdateMessage): Promise<void> {
    const {cards, place, loser} = message
    if (place > 0) {
      await this.handleWin()
    } else if (loser) {
      await this.handleLoss()
    }

    this.cards = cards
    this.isWinner = place > 0
    this.isLoser = loser
  }

  private handleServerDisconnect = (): void => {
    this.participating = false
    this.error = true
  }

  private async handleWin(): Promise<void> {
    if (await this.settingsService.getPopUps()) {
      const alert = await this.alertController.create({
        header: 'You won!',
        message: 'You\'re a winner! <span role="img" aria-label="ta-da">🎉</span>\n',
        buttons: ['I\'m awesome!']
      })
      await alert.present()
    }

    if (await this.settingsService.getSounds()) {
      const audio = new Audio('assets/sounds/win31.mp3')
      await audio.play()
    }
  }

  private async handleLoss(): Promise<void> {
    if (await this.settingsService.getPopUps()) {
      const alert = await this.alertController.create({
        header: 'You lost!',
        message: 'You\'re a loser! <span role="img" aria-label="thumb-down">👎</span>',
        buttons: ['I suck']
      })
      await alert.present()
    }

    if (await this.settingsService.getSounds()) {
      const audio = new Audio('assets/sounds/sadTrombone.mp3')
      await audio.play()
    }
  }

  private async handleBroughtBackToGame(me: boolean = false): Promise<void> {
    if (await this.settingsService.getSounds()) {
      const audio = new Audio('assets/sounds/airHorn.mp3')
      await audio.play()
    }

    if (me && await this.settingsService.getPopUps()) {
      const alert = await this.alertController.create({
        header: 'You\'ve been brought back to the game!',
        message: 'Another player has brought you back to the game with a 7 of Hearts!',
        buttons: ['Back to Game']
      })

      await alert.present()
    }
  }

  // noinspection JSMethodCanBeStatic
  private async playDrawCardSound(cards: number): Promise<void> {
    let audioFile: string
    switch (cards) {
      case 4:
        audioFile = 'assets/sounds/crack_the_whip.mp3'
        break
      case 6:
        audioFile = 'assets/sounds/drama.mp3'
        break
      case 8:
        audioFile = 'assets/sounds/holy_shit.mp3'
        break
      default:
        return
    }
    const audio = new Audio(audioFile)
    await audio.play()
  }
}
