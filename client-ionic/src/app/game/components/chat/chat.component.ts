import { Component, OnInit } from '@angular/core'
import { MenuController } from '@ionic/angular'
import { Message } from './chat.service'

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  messages: Message[] = []
  message = ''

  constructor(
    private menuController: MenuController,
  ) { }

  ngOnInit() {}

  async closeChat(): Promise<void> {
    await this.menuController.close('chat')
  }

  sendMessage() {
    console.log(this.message)
    this.message = ''
  }
}
