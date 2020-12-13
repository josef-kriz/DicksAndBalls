import { Injectable } from '@angular/core'
import { SwUpdate } from '@angular/service-worker'
import { forkJoin, Subject } from 'rxjs'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  updateAvailable$ = new Subject<boolean>()

  constructor(private alertController: AlertController, private translateService: TranslateService, private updates: SwUpdate) {
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
    const [header, message, cancelText, submitText] = await forkJoin([
      this.translateService.get('Main.new_version_available'),
      this.translateService.get('Main.new_version_message'),
      this.translateService.get('Main.new_version_cancel'),
      this.translateService.get('Main.new_version_submit'),
    ]).toPromise()

    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: cancelText,
          role: 'cancel',
        },
        {
          text: submitText,
          role: 'submit',
        },
      ],
    })

    await alert.present()
    const {role} = await alert.onWillDismiss()

    if (role === 'submit') {
      await this.updates.activateUpdate()
      window.location.reload()
    }
  }
}
