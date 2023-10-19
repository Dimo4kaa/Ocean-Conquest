export class Ship {
  size: number;
  direction: string;
  killed = false;
  x: number;
  y: number;

  constructor(size: number, direction: string, x: number, y: number) {
    this.size = size;
    this.direction = direction;
    this.x = x;
    this.y = y;
  }
}
