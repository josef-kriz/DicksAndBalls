import { Injectable } from '@angular/core'
import { MainSocket } from '../sockets/main.socket'
import { Observable, BehaviorSubject, forkJoin } from 'rxjs'
import { JoinTableMessage, TableInfo, TableUpdateMessage } from '../models/message'
import { AddTableMessage } from '../../../../src/models/message'
import { ChatService } from '../chat/chat.service'
import { Router } from '@angular/router'
import { tap } from 'rxjs/operators'
import { AlertController, LoadingController, MenuController } from '@ionic/angular'
import { focusOnAlertInput } from '../util/helpers'
import { TranslateService } from '@ngx-translate/core'

const DEFAULT_TABLE: TableInfo = {
  id: 'main',
  name: 'Main',
  playersCount: 0,
}

@Injectable({
  providedIn: 'root',
})
export class TableService {
  currentTable$ = new BehaviorSubject<TableInfo>(DEFAULT_TABLE)

  private reconnecting = false
  private tables: TableInfo[] = []

  constructor(
    private alertController: AlertController,
    private chatService: ChatService,
    private loadingController: LoadingController,
    private menuController: MenuController,
    private router: Router,
    private socket: MainSocket,
    private translateService: TranslateService,
  ) {
    this.socket.on('disconnect', async () => {
      await this.showConnectionError()
    })

    this.socket.on('connect_error', async () => {
      await this.showConnectionError()
    })

    this.socket.on('connect', async () => {
      if (this.reconnecting) {
        await this.loadingController.dismiss()
        this.reconnecting = false
      }

      this.joinTable(this.currentTable$.getValue().id)
    })
  }

  getTables(): Observable<TableUpdateMessage> {
    return this.socket.fromEvent<TableUpdateMessage>('table_event').pipe(
      tap(message => this.tables = message.tables),
    )
  }

  joinTable(tableId: string): void {
    const joinMessage: JoinTableMessage = {
      type: 'join_table',
      id: tableId,
    }
    this.socket.emit('player_event', joinMessage, (): void => {
      // the table doesn't exist
      this.router.navigate(['table', 'main']).then()
    })

    const table = this.tables.find(table => table.id === tableId)
    if (table) this.currentTable$.next(table)

    if (this.currentTable$.getValue().id !== tableId) this.chatService.changeContext()
  }

  async addTable(): Promise<void> {
    const tableName = await this.askForTableName()
    if (!tableName) { return }
    const message: AddTableMessage = {
      type: 'add_table',
      name: tableName,
    }

    this.socket.emit('table_event', message, async (error?: string, id?: string) => {
      if (error) {
        const translatedErrorMessage = await this.translateService.get(error).toPromise()
        await this.showErrorAlert(translatedErrorMessage)
      } else if (id) {
        await this.router.navigate(['table', id])
        await this.menuController.close('main-menu')
        this.chatService.changeContext()
      }
    })
  }

  dispose(): void {
    this.socket.removeAllListeners('table_event')
  }

  private async askForTableName(): Promise<string | undefined> {
    const [header, message, placeholder, cancelText, createTableText] = await forkJoin([
      this.translateService.get('Main.table_name_header'),
      this.translateService.get('Main.table_name_message'),
      this.translateService.get('Main.table_name_placeholder'),
      this.translateService.get('cancel'),
      this.translateService.get('Main.table_name_submit'),
    ]).toPromise()

    const alert = await this.alertController.create({
      header,
      message,
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder,
        },
      ],
      buttons: [
        {
          text: cancelText,
          role: 'cancel',
        },
        {
          text: createTableText,
          role: 'submit',
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
    }
  }

  async showErrorAlert(message?: string): Promise<void> {
    const [header, defaultText, okText] = await forkJoin([
      this.translateService.get('error'),
      this.translateService.get('Main.table_name_error'),
      this.translateService.get('ok'),
    ]).toPromise()

    if (!message) message = defaultText

    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: okText,
        },
      ]
    })

    await alert.present()
  }

  private async showConnectionError(): Promise<void> {
    this.reconnecting = true

    if (!(await this.loadingController.getTop())) {
      const messageText = await this.translateService.get('Main.connection_error').toPromise()
      const message = await this.loadingController.create({
        message: messageText,
      })
      await message.present()

      // abort presenting if message should have already been dismissed
      if (!this.reconnecting) await message.dismiss()
    }
  }
}
