import { Injectable } from '@angular/core';
import { MainSocket } from '../sockets/main.socket'
import { Observable } from 'rxjs'
import { JoinTableMessage, TableInfo, TableUpdateMessage } from '../models/message'
import { AddTableMessage } from '../../../../src/models/message'
import { ChatService } from '../chat/chat.service'
import { Router } from '@angular/router'
import { tap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class TablesService {
  currentTable?: TableInfo
  private tables: TableInfo[] = []

  constructor(
    private chatService: ChatService,
    private router: Router,
    private socket: MainSocket,
    ) { }

  getTables(): Observable<TableUpdateMessage> {
    return this.socket.fromEvent<TableUpdateMessage>('table_event').pipe(
      tap(message => this.tables = message.tables)
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
    const findTable = this.tables.find(table => table.id === tableId)
    if (findTable) {
      this.currentTable = findTable
    }
    this.chatService.changeContext()
  }

  addTable(message: AddTableMessage, callback: (error?: string, id?: string) => void): void {
    this.socket.emit('table_event', message, callback)
  }

  stop(): void {
    this.socket.removeAllListeners('table_event')
  }
}
