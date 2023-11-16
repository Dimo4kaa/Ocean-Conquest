import { Battlefield } from './Battlefield.js';
export class Player {
    constructor(socket) {
        this.battlefield = new Battlefield();
        this.socket = null;
        this.party = null;
        this.socket = socket;
    }
    emit(eventName, payload1, payLoad2) {
        if (this.socket && this.socket.connected) {
            switch (eventName) {
                case 'turnUpdate':
                    this.socket.emit(eventName, payload1);
                    break;
                case 'statusChange':
                    this.socket.emit(eventName, payload1);
                    break;
                case 'setShots':
                    this.socket.emit(eventName, payload1, payLoad2);
                    break;
            }
        }
        return true;
    }
}
