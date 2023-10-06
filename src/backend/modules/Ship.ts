export class Ship {
  size: number;
  direction: string;
  killed = false;

  //!!!
  x: number | null = null;
  y: number | null = null;

  get placed() {
    return this.x !== null && this.y !== null;
  }

  constructor(size: number, direction: string) {
    this.size = size;
    this.direction = direction;
  }
}
