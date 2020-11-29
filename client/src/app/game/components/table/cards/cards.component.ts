import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core'
import { Card, getCardsAssetNumber, Suit } from '../../../../models/card'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser'
import { GameService } from '../../../game.service'
import { AddPlayerMessage, PlayersTurnMessage } from '../../../../models/message'
import { PlayerAction } from '../../../../models/player-action'
import { AlertController, ModalController } from '@ionic/angular'
import { SelectSuitComponent } from '../select-suit/select-suit.component'
import { SettingsService } from '../../../../settings/settings.service'
import { focusOnAlertInput } from '../../../../util/helpers'

interface CardWithBackground extends Card {
  background: SafeStyle
}

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent implements OnChanges {
  @Input() readonly participating?: boolean
  @Input() readonly gameActive?: boolean
  @Input() readonly cards?: Card[]
  @Input() readonly playerName?: string
  @Input() readonly playerOnTurn?: string
  @Input() readonly isWinner?: boolean
  @Input() readonly isLoser?: boolean
  @Input() readonly isSkippingTurn?: boolean
  @Input() readonly shouldDraw?: number
  @Input() readonly playersCount?: number
  @Output() nameChange: EventEmitter<string> = new EventEmitter()

  cardType = 'single-headed'
  showCards = false
  cardsWithBackgrounds?: CardWithBackground[]

  constructor(
    private alertController: AlertController,
    private gameService: GameService,
    private modalController: ModalController,
    private sanitizer: DomSanitizer,
    private settingsService: SettingsService,
    ) {
    this.settingsService.getCardType().subscribe(type => this.cardType = type)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.participating || changes.gameActive || changes.isWinner || changes.isLoser) {
      this.showCards = this.shouldShowCards()
    }
    if (changes.cards) {
      this.cardsWithBackgrounds = this.cards?.map((card: Card) => ({
        ...card,
        background: this.getCardUrl(card),
      }))
    }
  }

  shouldShowCards(): boolean {
    if (!this.participating) {
      return false
    }
    if (this.gameActive) {
      return true
    }
    return !!(this.isWinner || this.isLoser);
  }

  async joinGame(): Promise<void> {
    try {
      const playerName = await this.askForName()
      const message: AddPlayerMessage = {
        type: 'add_player',
        player: playerName,
      }

      this.gameService.sendMessage(message, (result: string) => {
        if (result !== 'success') {
          this.showErrorAlert(result)
        } else {
          this.nameChange.emit(playerName)
          this.settingsService.setPlayerName(playerName)
        }
      })
    } catch (e) {
    }
  }

  trackByCard(_: number, card: CardWithBackground): string {
    return `${card.suit}${card.value}`
  }

  async playCard(card: Card): Promise<void> {
    // remove properties extended from the Card interface
    const pureCard = {
      suit: card.suit,
      value: card.value,
    }

    if (
      this.gameActive &&
      !this.isSkippingTurn &&
      this.playerOnTurn === this.playerName &&
      this.shouldDraw === 0 &&
      pureCard.value === 'Queen'
    ) {
      const changeColorTo = await this.askForSuit()
      if (changeColorTo) {
        this.sendPlayerAction({
          action: 'card_played',
          card: pureCard,
          changeColorTo,
        })
      }
    } else {
      this.sendPlayerAction({
        action: 'card_played',
        card: pureCard,
      })
    }
  }

  private getCardUrl(card: Card): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`url("assets/cards/${this.cardType}/${getCardsAssetNumber(card)}.png")`)
  }

  private async askForName(): Promise<string> {
    const alert = await this.alertController.create({
      header: 'Choose a Name',
      message: 'Insert a name that will be seen by your opponents.',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Put your name here',
          value: await this.settingsService.getPlayerName()
        },
      ],
      buttons: [
        {
          text: 'Join Game',
          role: 'submit',
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alertCancelButton',
        }
      ]
    })

    await alert.present()

    focusOnAlertInput(alert)

    const dismiss = await alert.onWillDismiss()

    if (
      dismiss &&
      dismiss.role === 'submit' &&
      dismiss.data &&
      dismiss.data.values
    ) {
      return dismiss.data.values.name
    } else {
      throw new Error('No name given')
    }
  }

  private async showErrorAlert(message = 'The server rejected your username'): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Invalid Name',
      message,
      buttons: [
        {
          text: 'OK',
        },
      ]
    })

    await alert.present()
  }

  private sendPlayerAction(action: PlayerAction): void {
    const message: PlayersTurnMessage = {
      type: 'players_turn',
      action,
    }
    this.gameService.sendMessage(message)
  }

  private async askForSuit(): Promise<Suit | void> {
    const modal = await this.modalController.create({
      component: SelectSuitComponent,
      cssClass: 'select-suit-modal',
    });
    await modal.present();
    const dismiss = await modal.onWillDismiss()
    if (dismiss.role === 'submit' && dismiss.data) { return dismiss.data }
  }
}
