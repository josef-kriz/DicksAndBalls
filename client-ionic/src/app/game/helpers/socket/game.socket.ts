import { Injectable } from '@angular/core'
import { Socket } from 'ngx-socket-io'

@Injectable()
export class GameSocket extends Socket {

    constructor() {
        // super({ url: window.location.href, options: {} });
        super({ url: 'http://localhost:3001', options: {} });
    }

}
