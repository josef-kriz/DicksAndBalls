import { Injectable } from '@angular/core'
import { io, Socket } from 'socket.io-client'
import { environment } from '../../environments/environment'
import { Observable } from 'rxjs'
import { share } from 'rxjs/operators'

@Injectable()
export class MainSocket {
  subscribersCounter: Record<string, number> = {};
  eventObservables$: Record<string, Observable<any>> = {};
  ioSocket: Socket;

  constructor() {
    this.ioSocket = io(environment.serverUrl)
  }

  on(eventName: string, callback: Function) {
    this.ioSocket.on(eventName, callback);
  }

  emit(eventName: string, ...args: any[]) {
    return this.ioSocket.emit(eventName, ...args);
  }

  // removeListener(eventName: string, callback?: Function) {
  //   return this.ioSocket.off(eventName, callback);
  // }

  removeAllListeners(eventName?: string) {
    return this.ioSocket.off(eventName);
  }

  fromEvent<T>(eventName: string): Observable<T> {
    if (!this.subscribersCounter[eventName]) {
      this.subscribersCounter[eventName] = 0;
    }
    this.subscribersCounter[eventName]++;

    if (!this.eventObservables$[eventName]) {
      this.eventObservables$[eventName] = new Observable((observer: any) => {
        const listener = (data: T) => {
          observer.next(data);
        };
        this.ioSocket.on(eventName, listener);
        return () => {
          this.subscribersCounter[eventName]--;
          if (this.subscribersCounter[eventName] === 0) {
            this.ioSocket.off(eventName, listener);
            delete this.eventObservables$[eventName];
          }
        };
      }).pipe(
        share()
      );
    }
    return this.eventObservables$[eventName];
  }
}
