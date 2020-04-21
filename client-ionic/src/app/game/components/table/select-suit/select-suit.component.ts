import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular'
import { Suit } from '../../../models/card'

@Component({
  selector: 'app-select-suit',
  templateUrl: './select-suit.component.html',
  styleUrls: ['./select-suit.component.scss'],
})
export class SelectSuitComponent {
  constructor(private modalController: ModalController) {}

  async selectSuit(suit: Suit): Promise<void> {
    await this.modalController.dismiss(suit, 'submit')
  }

  async cancel(): Promise<void> {
    await this.modalController.dismiss(undefined, 'cancel')
  }
}
