import { Battlefield } from './Battlefield.js';

export class Player {
  battlefield = new Battlefield();
  socket: any = null;
  party: any = null;
  sessionId: any = null;

  get ready() {
    return this.battlefield.complete && !this.party && this.socket;
  }

  constructor(socket: any, sessionId: any) {
    Object.assign(this, { socket, sessionId });
  }

  on(...args: any) {
    if (this.socket && this.socket.connected) {
      this.socket.on(...args);
    }
  }

  emit(...args: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(...args);
    }
  }
}
