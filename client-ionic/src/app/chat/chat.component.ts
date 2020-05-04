import { Component, OnInit, ViewChild } from '@angular/core'
import { MenuController } from '@ionic/angular'
import { ChatService, Message } from './chat.service'
import { TablesService } from '../services/tables.service'

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  @ViewChild('chatContent') private readonly chatContent?: HTMLIonContentElement;
  messages: Message[] = []
  message = ''

  constructor(
    private chatService: ChatService,
    private menuController: MenuController,
    public tablesService: TablesService,
  ) {
  }

  ngOnInit(): void {
    this.chatService.getMessages().subscribe(async message => {
      this.messages.push(message)
      this.chatContent?.scrollToBottom(500)
    })
    this.chatService.contextChanged.subscribe(() => this.messages = [])
  }

  async openChat(): Promise<void> {
    await this.menuController.open('chat');
    (document.querySelector('#chat-input > input') as HTMLInputElement)?.focus()
  }

  async closeChat(): Promise<void> {
    await this.menuController.close('chat')
  }

  async sendMessage(): Promise<void> {
    if (this.message) {
      await this.chatService.sendMessage(this.message)
      this.message = ''
    }
  }
}
