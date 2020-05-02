import { Injectable } from '@angular/core';

export interface Message {
  text: string
  author: string
  own: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor() { }
}
