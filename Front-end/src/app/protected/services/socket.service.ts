import { EventEmitter, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
    providedIn: 'root'
}) 

export class SocketService extends Socket {

    outEven: EventEmitter<any> = new EventEmitter();
    callback: EventEmitter<any> = new EventEmitter();

    constructor() {
        super({
            url: "http://localhost:8080"
        });

        this.listen();
    }

    listen = () => {
        this.ioSocket.on('event', (res: any) => this.callback.emit(res));
    }

    emitEvent = (payload = {}) => {
        console.log(payload);
        this.ioSocket.emit('event', payload);
    }
}