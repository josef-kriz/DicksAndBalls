import { Injectable } from '@angular/core';
import { ClientMessage, ServerMessage } from './models/message'
import { Observable } from 'rxjs'
import { GameSocket } from './helpers/socket/game.socket'

@Injectable({
  providedIn: 'root'
})
export class GameService {
  constructor(private socket: GameSocket) { }

  getMessages(): Observable<ServerMessage> {
    return this.socket.fromEvent<ServerMessage>('server_event')
  }

  onDisconnect(): Observable<void> {
    return this.socket.fromEvent<void>('disconnect')
  }

  sendMessage(message: ClientMessage, callback?: any): void {
    this.socket.emit('player_event', message, callback)
  }

  stop(): void {
    this.socket.removeAllListeners('server_event')
    this.socket.removeAllListeners('disconnect')
  }
}
