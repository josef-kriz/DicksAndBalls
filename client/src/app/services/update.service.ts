import { Injectable } from '@angular/core'
import { SwUpdate } from '@angular/service-worker'
import { Subject } from 'rxjs'
import { AlertController } from '@ionic/angular'

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  updateAvailable$ = new Subject<boolean>()

  constructor(private alertController: AlertController, private updates: SwUpdate) {
    if (updates.isEnabled) {
      updates.available.subscribe(async (event) => {
        if (event.current.hash !== event.available.hash) {
          this.updateAvailable$.next(true)
          await this.showUpdateAlert()
        }
      })
    }
  }

  async showUpdateAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'New version available!',
      message: 'Would you like to refresh Prší to update?',
      buttons: [
        {
          text: 'Not now',
          role: 'cancel',
        },
        {
          text: 'Refresh',
          role: 'submit',
        },
      ],
    })

    await alert.present()
    const { role } = await alert.onWillDismiss()

    if (role === 'submit') {
      await this.updates.activateUpdate()
      window.location.reload()
    }
  }
}
