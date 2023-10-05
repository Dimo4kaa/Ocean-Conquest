import { Ship } from './Ship';
import { isUnderPoint } from './utils';

export class ShipView extends Ship {
  div: HTMLDivElement;

  startX: number;
  startY: number;

  constructor(size: number, direction: string, startX: number, startY: number) {
    super(size, direction);

    this.div = document.createElement('div');
    this.div.classList.add('ship');
    this.startX = startX;
    this.startY = startY;

    this.setDirection(direction, true);
  }

  setDirection(newDirection: string, force = false) {
    if (!force && this.direction === newDirection) {
      return false;
    }

    this.div.classList.remove(`ship-${this.direction}-${this.size}`);
    this.direction = newDirection;
    this.div.classList.add(`ship-${this.direction}-${this.size}`);

    return true;
  }

  toggleDirection() {
    const newDirection = this.direction === 'row' ? 'column' : 'row';
    this.setDirection(newDirection);
  }

  //!!!
  isUnder(point: any) {
    return isUnderPoint(point, this.div);
  }
}
