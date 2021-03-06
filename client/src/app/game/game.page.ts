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
  ServerMessage,
  TextMessage,
} from '../models/message'
import inactivityDetection from './helpers/inactivity-detection'
import { MenuController, Platform } from '@ionic/angular'
import { SettingsService } from '../settings/settings.service'
import { ComponentCanDeactivate } from './helpers/leave-game.guard'
import { forkJoin, Observable } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { TableService } from '../services/table.service'
import { MenuService } from '../services/menu.service'
import { ChatService } from '../chat/chat.service'
import { GamePromptsService } from './helpers/game-prompts.service'
import { TranslateService } from '@ngx-translate/core'
import { OnTurnTitleService } from './helpers/on-turn-title.service'

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements ComponentCanDeactivate {
  tableId = 'main'
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

  currentTable$ = this.tableService.currentTable$
  isMenuEnabled$ = this.menuService.menuEnabled$
  unreadChatMessages$ = this.chatService.unread$

  private error = false

  constructor(
    private chatService: ChatService,
    private gamePromptsService: GamePromptsService,
    private gameService: GameService,
    private onTurnTitleService: OnTurnTitleService,
    private menuController: MenuController,
    private menuService: MenuService,
    private platform: Platform,
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private tableService: TableService,
    private translateService: TranslateService,
  ) {
  }

  // noinspection JSUnusedGlobalSymbols
  ionViewWillEnter(): void {
    const id = this.route.snapshot.paramMap.get('tableId')
    if (id) {
      this.tableId = id
    }

    this.gameService.getMessages().subscribe(
      this.handleServerMessage,
      () => this.error = true)

    this.gameService.onDisconnect().subscribe(
      this.handleServerDisconnect,
    )

    this.tableService.joinTable(this.tableId)
  }

  // noinspection JSUnusedGlobalSymbols
  ionViewWillLeave(): void {
    const message: RemovePlayerMessage = {
      type: 'remove_player',
      tableId: this.tableId,
    }
    this.gameService.sendMessage(message)
    this.playerName = undefined
    this.gameService.dispose()
  }

  /**
   * Checks whether the user can leave the page
   */
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !(this.participating && !!this.active && !!this.cards && this.cards.length > 0)
  }

  async showMenu(): Promise<void> {
    await this.menuService.showMenu()
  }

  async openChat(): Promise<void> {
    await this.menuController.open('chat')
  }

  private handleServerMessage = async (message: ServerMessage): Promise<void> => {
    if (this.error) {
      this.error = false
    }
    if (isErrorMessage(message)) {
      await this.handleErrorMessage(message)
    } else if (isGameStateMessage(message)) {
      await this.handleGameStateUpdate(message)
    } else if (isGameUpdateMessage(message)) {
      await this.handleGameUpdate(message)
    } else if (isPlayerUpdateMessage(message)) {
      await this.handlePlayerUpdate(message)
    }
  }

  private async handleErrorMessage(message: ErrorMessage): Promise<void> {
    const translatedMessage = await this.translateService.get(message.message).toPromise()
    this.message = {
      error: true,
      text: translatedMessage,
    }
  }

  private async handleGameStateUpdate(message: GameStateMessage): Promise<void> {
    const {active, players} = message
    this.active = active
    this.players = players
    this.participating = players.some(player => player.name === this.playerName)

    if (this.participating && !this.active) {
      const [shuffleMessage, notEnoughPlayersMessage] = await forkJoin([
        this.translateService.get('Messages.shuffle_deck'),
        this.translateService.get('Messages.not_enough_players'),
      ]).toPromise()

      this.message = {
        error: false,
        text: this.players.length >= 2 ? shuffleMessage : notEnoughPlayersMessage,
      }
    }

    if (!active) {
      inactivityDetection.stopDetecting()
      this.onTurnTitleService.removeText()
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
      drewCards,
    } = message

    this.colorChangedTo = colorChangedTo
    this.deckTop = deckTop
    this.playerOnTurn = playerOnTurn
    this.message = {
      error: false,
      text: await this.parseTextMessage(message.message),
    }
    this.isSkippingTurn = this.participating && skippingNextPlayer && playerOnTurn === this.playerName
    this.shouldDraw = playerOnTurn === this.playerName ? shouldDraw : 0
    this.cardsInDeck = cardsInDeck

    if (playerOnTurn === this.playerName && this.active) { // update page title and start inactivity detection (if sounds are allowed)
      await this.onTurnTitleService.addText()
      if (await this.settingsService.getSounds()) {
        const inactivityTimeout = await this.platform.is('mobile') ? 10000 : undefined
        inactivityDetection.startDetecting(inactivityTimeout)
      }
    } else this.onTurnTitleService.removeText()

    if (playerOnTurn) {
      this.scrollToCards(playerOnTurn)
    }

    await this.gamePromptsService.playDrawCardSound(drewCards)
    if (broughtBackToGame) {
      await this.gamePromptsService.handleBroughtBackToGame(broughtBackToGame === this.playerName)
    }
  }

  private async handlePlayerUpdate(message: PlayerUpdateMessage): Promise<void> {
    const {cards, place, loser} = message

    this.cards = cards
    this.isWinner = place > 0
    this.isLoser = loser

    if (place > 0) {
      await this.gamePromptsService.handleWin()
    } else if (loser) {
      await this.gamePromptsService.handleLoss()
    }

  }

  private async translateTextMessage(message: TextMessage): Promise<string> {
    if (message.values) {
      // translate nested values
      for (let [key, value] of Object.entries(message.values)) {
        if (typeof value !== 'string') message.values[key] = await this.translateTextMessage(value)
      }
    }

    return await this.translateService.get(message.translationId, message.values).toPromise()
  }

  private async parseTextMessage(messages: TextMessage[]): Promise<string> {
    const translations = await Promise.all(messages.map(async (message) => await this.translateTextMessage(message)))
    return translations.join('')
  }

  private handleServerDisconnect = (): void => {
    this.participating = false
    this.error = true
    inactivityDetection.stopDetecting()
  }

  // scroll to player's cards (applies only when overflowing)
  // noinspection JSMethodCanBeStatic
  private scrollToCards(playerOnTurn: string): void {
    const playersEl = document.getElementById('players')
    const playerEl = document.getElementById(playerOnTurn)
    if (playersEl && playersEl.scrollWidth !== playersEl.clientWidth && playerEl) {
      const offset = playerEl.offsetLeft - playersEl.offsetWidth / 2 + playerEl.scrollWidth / 2
      const rangedOffset = Math.min(Math.max(offset, 0), playersEl.scrollWidth - playersEl.offsetWidth)
      playersEl.scrollTo({behavior: 'smooth', left: rangedOffset})
    }
  }
}
