import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular'

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
})
export class RulesComponent {

  constructor(private modalController: ModalController) { }

  async closeModal(): Promise<void> {
    await this.modalController.dismiss()
  }
}
