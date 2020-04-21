import { Component, Input } from '@angular/core'
import { Card, getCardsAssetNumber, Suit } from '../../../models/card'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser'
import { GameService } from '../../../game.service'
import { PlayersTurnMessage } from '../../../models/message'
import { PlayerAction } from '../../../models/playerAction'
import { ModalController } from '@ionic/angular'
import { SelectSuitComponent } from '../select-suit/select-suit.component'

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent {
  @Input() readonly gameActive?: boolean
  @Input() readonly cards?: Card[]
  @Input() readonly playerName?: string
  @Input() readonly playerOnTurn?: string
  @Input() readonly isSkippingTurn?: boolean
  @Input() readonly shouldDraw?: number

  constructor(
    private gameService: GameService,
    private modalController: ModalController,
    private sanitizer: DomSanitizer,
    ) {
  }

  getCardUrl(card: Card): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`url("assets/cards/${getCardsAssetNumber(card)}.png")`)
  }

  async playCard(card: Card): Promise<void> {
    if (
      this.gameActive &&
      !this.isSkippingTurn &&
      this.playerOnTurn === this.playerName &&
      this.shouldDraw === 0 &&
      card.value === 'T'
    ) {
      const changeColorTo = await this.askForSuit()
      if (changeColorTo) {
        this.sendPlayerAction({
          action: 'card_played',
          card,
          changeColorTo,
        })
      }
    } else {
      this.sendPlayerAction({
        action: 'card_played',
        card,
      })
    }
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
