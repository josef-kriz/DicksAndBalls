import { Injectable } from '@angular/core';
import { MainSocket } from '../sockets/main.socket'
import { Observable } from 'rxjs'
import { TableUpdateMessage } from '../models/message'
import { AddTableMessage } from '../../../../src/models/message'

@Injectable({
  providedIn: 'root'
})
export class TablesService {
  constructor(private socket: MainSocket) { }

  getTables(): Observable<TableUpdateMessage> {
    return this.socket.fromEvent<TableUpdateMessage>('table_event')
  }

  addTable(message: AddTableMessage, callback: (error?: string, id?: string) => void): void {
    this.socket.emit('table_event', message, callback)
  }

  stop(): void {
    this.socket.removeAllListeners('table_event')
  }
}
