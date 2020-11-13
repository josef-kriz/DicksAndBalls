import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular'

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {

  constructor(private modalController: ModalController) { }

  async closeModal(): Promise<void> {
    await this.modalController.dismiss()
  }
}
