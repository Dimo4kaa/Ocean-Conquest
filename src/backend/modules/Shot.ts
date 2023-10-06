export class Shot {
  x: number;
  y: number;
  variant: string;

  constructor(x: number, y: number, variant = 'miss') {
    this.x = x;
    this.y = y;
    this.variant = variant;
  }

  setVariant(variant: string) {
    this.variant = variant;
  }
}
