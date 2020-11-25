import { Component, OnDestroy, OnInit } from '@angular/core'

import { AlertController, MenuController, ModalController, Platform } from '@ionic/angular'
import { SplashScreen } from '@ionic-native/splash-screen/ngx'
import { StatusBar } from '@ionic-native/status-bar/ngx'
import { AboutComponent } from './about/about.component'
import { RulesComponent } from './rules/rules.component'
import { SettingsComponent } from './settings/settings.component'
import { SettingsService } from './settings/settings.service'
import { TableService } from './services/table.service'
import { isTableUpdateMessage, TableInfo, TableUpdateMessage } from './models/message'
import { AddTableMessage } from '../../../src/models/message'
import { Router } from '@angular/router'
import { ChatService } from './chat/chat.service'
import { MenuService } from './services/menu.service'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public selectedIndex = 0
  public tables?: TableInfo[]
  public isMenuEnabled = this.menuService.menuEnabled
  private init: Promise<void>

  constructor(
    private alertController: AlertController,
    private chatService: ChatService,
    private menuController: MenuController,
    private menuService: MenuService,
    private modalController: ModalController,
    private platform: Platform,
    private router: Router,
    private settingsService: SettingsService,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private tableService: TableService,
  ) {
    this.init = this.initializeApp()
  }

  async initializeApp(): Promise<void> {
    await this.platform.ready()
    if (this.platform.is('hybrid')) {
      this.statusBar.styleDefault()
      this.splashScreen.hide()
    }
  }

  async ngOnInit(): Promise<void> {
    // subscribe to tables changes
    this.tableService.getTables().subscribe(this.handleTablesMessage) // TODO error handling

    // set correct theme based on settings
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
    // if user wants to use system's theme, update it (and register a listener)
    if (await this.settingsService.getSystemTheme()) {
      await this.settingsService.setDarkTheme(prefersDark.matches)
    } else {
      await this.settingsService.setDarkTheme(await this.settingsService.getDarkTheme())
    }
    prefersDark.addEventListener('change', async (mediaQuery) => {
      if (await this.settingsService.getSystemTheme()) {
        await this.settingsService.setDarkTheme(mediaQuery.matches)
      }
    })

    this.isMenuEnabled.next(await this.menuController.isEnabled('main-menu'))
  }

  ngOnDestroy(): void {
    this.tableService.dispose()
  }

  async openSettings(): Promise<void> {
    const modal = await this.modalController.create({
      component: SettingsComponent,
    })
    await modal.present()
  }

  async openRules(): Promise<void> {
    const modal = await this.modalController.create({
      component: RulesComponent,
    })
    await modal.present()
  }

  async openAbout(): Promise<void> {
    const modal = await this.modalController.create({
      component: AboutComponent,
    })
    await modal.present()
  }

  async hideMenu(): Promise<void> {
    await this.menuController.enable(false, 'main-menu')
    this.isMenuEnabled.next(false)
  }

  async addTable(): Promise<void> {
    const tableName = await this.askForTableName()
    if (!tableName) { return }
    const message: AddTableMessage = {
      type: 'add_table',
      name: tableName,
    }

    this.tableService.addTable(message, (error?: string, id?: string) => {
      if (error) {
        this.showErrorAlert(error)
      } else if (id) {
        this.router.navigate(['table', id])
        this.menuController.close('main-menu')
        this.chatService.changeContext()
      }
    })
  }

  private handleTablesMessage = async (message: TableUpdateMessage): Promise<void> => {
    if (isTableUpdateMessage(message)) {
      this.tables = message.tables

      // set selected menu item
      const path = window.location.pathname.split('table/')[1]
      if (path !== undefined) {
        this.selectedIndex = this.tables.findIndex(table => table.id.toLowerCase() === path.toLowerCase())
        if (this.selectedIndex === -1) {
          await this.router.navigate(['table', 'main'])
        }
      }
    }
  }

  private async askForTableName(): Promise<string | undefined> {
    const alert = await this.alertController.create({
      header: 'Table Name',
      message: 'Insert a short table name.',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Put the name here',
        },
      ],
      buttons: [
        {
          text: 'Create',
          role: 'submit',
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alertCancelButton',
        }
      ]
    })

    // TODO duplicate code
    await alert.present()

    // manually set focus and key press handler to the input element
    const alertInput: HTMLInputElement | null = document.querySelector('ion-alert input')
    if (alertInput) {
      alertInput.focus()
      alertInput.onkeyup = (event) => {
        if (event.key === 'Enter') {
          alert.dismiss({values: {name: alertInput.value}}, 'submit')
        }
      }
    }

    const dismiss = await alert.onWillDismiss()

    if (
      dismiss &&
      dismiss.role === 'submit' &&
      dismiss.data &&
      dismiss.data.values
    ) {
      return dismiss.data.values.name
    }
  }

  // TODO move to separate component
  private async showErrorAlert(message = 'Cannot create a new table now'): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: [
        {
          text: 'OK',
        },
      ]
    })

    await alert.present()
  }
}
