import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { SettingsService } from '../settings/settings.service'
import { MainSocket } from '../sockets/main.socket'

export interface Message {
  id: string,
  author: string
  text: string
  own: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  contextChanged$ = new Subject<undefined>() // used for triggering functions when switching chats
  unread$ = new BehaviorSubject<number>(0) // used for keeping the number of unread messages

  constructor(
    private settingsService: SettingsService,
    private socket: MainSocket,
  ) {
  }

  getMessages(): Observable<Message> {
    return this.socket.fromEvent('chat_message')
  }

  async sendMessage(text: string): Promise<void> {
    const author = (await this.settingsService.getPlayerName()) || 'Anonymous'
    this.socket.emit('chat_message', {
      type: 'chat_message',
      author,
      text,
    })
  }

  /**
   * Explicitly notify that the chat context was changed (like a table was switched and old chat messages should be removed)
   */
  changeContext(): void {
    this.contextChanged$.next()
  }
}
