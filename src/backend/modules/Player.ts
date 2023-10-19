import { Socket } from 'socket.io';
import { Battlefield } from './Battlefield.js';
import { Party } from './Party.js';
import { shotItem } from './types.js';

export class Player {
  battlefield = new Battlefield();
  socket: Socket | null = null;
  party: Party | null = null;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  emit(eventName: 'turnUpdate', ownTurn: boolean): boolean;
  emit(eventName: 'statusChange', status: 'play' | 'winner' | 'loser' | 'randomFinding'): boolean;
  emit(eventName: 'setShots', ownShots1: shotItem[], ownShots2: shotItem[]): boolean;
  emit(eventName: string, payload1: boolean | string | shotItem[], payLoad2?: shotItem[]) {
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
