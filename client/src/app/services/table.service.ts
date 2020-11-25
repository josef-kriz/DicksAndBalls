import { Injectable } from '@angular/core'
import { MainSocket } from '../sockets/main.socket'
import { Observable, BehaviorSubject } from 'rxjs'
import { JoinTableMessage, TableInfo, TableUpdateMessage } from '../models/message'
import { AddTableMessage } from '../../../../src/models/message'
import { ChatService } from '../chat/chat.service'
import { Router } from '@angular/router'
import { tap } from 'rxjs/operators'
import { LoadingController } from '@ionic/angular'

const DEFAULT_TABLE: TableInfo = {
  id: 'main',
  name: 'Main',
  playersCount: 0,
}

@Injectable({
  providedIn: 'root',
})
export class TableService {
  currentTable = new BehaviorSubject<TableInfo>(DEFAULT_TABLE)

  private reconnecting?: HTMLIonLoadingElement
  private tables: TableInfo[] = []

  constructor(
    private chatService: ChatService,
    private loadingController: LoadingController,
    private router: Router,
    private socket: MainSocket,
  ) {
    this.socket.on('disconnect', async () => {
      await this.showConnectionError()
    })
    this.socket.on('connect_error', async () => {
      await this.showConnectionError()
    })
    this.socket.on('connect', async () => {
      if (this.reconnecting) {
        await this.reconnecting.dismiss()
      }

      this.joinTable(this.currentTable.getValue().id)
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
    if (table) {
      this.currentTable.next(table)
    }
    this.chatService.changeContext()
  }

  addTable(message: AddTableMessage, callback: (error?: string, id?: string) => void): void {
    this.socket.emit('table_event', message, callback)
  }

  dispose(): void {
    this.socket.removeAllListeners('table_event')
  }

  private async showConnectionError(): Promise<void> {
    if (!(await this.loadingController.getTop())) {
      this.reconnecting = await this.loadingController.create({
        message: 'Either you or the server went offline. Reconnecting...',
      })
      await this.reconnecting.present()
    }
  }
}
