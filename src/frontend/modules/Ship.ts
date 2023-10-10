import { isUnderPoint } from "./utils";

export class Ship {
  startX: number;
  startY: number;

  size: number;
  direction!: string;
  div: HTMLDivElement;
  killed = false;

  x: number | null;
  y: number | null;

  constructor(size: number, direction: string, startX: number, startY: number) {
    this.startX = startX;
    this.startY = startY;
    this.size = size;
    this.div = document.createElement('div');
    this.div.classList.add('ship');
    this.setDirection(direction, true);
    this.x = null;
    this.y = null;
  }

  get placed() {
    return this.x !== null && this.y !== null;
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
}
