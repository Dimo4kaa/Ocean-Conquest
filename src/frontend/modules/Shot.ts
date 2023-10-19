export class Shot {
  x: number;
  y: number;
  variant: string;
  div: HTMLDivElement;

  constructor(x: number, y: number, variant = 'miss') {
    const div = document.createElement('div');
    div.classList.add('shot');
    this.div = div;
    this.x = x;
    this.y = y;
    this.variant = variant;
    if (this.variant === 'miss') {
      this.div.classList.add('shot-missed');
      this.div.textContent = '•';
    } else if (this.variant === 'wounded') {
      this.div.classList.add('shot-wounded');
    } else if (this.variant === 'killed') {
      this.div.classList.add('shot-wounded', 'shot-killed');
    }
  }

  setVariant(variant: string) {
    this.variant = variant;

    this.div.classList.remove('shot-missed', 'shot-wounded', 'shot-killed');
    this.div.textContent = '';

    if (this.variant === 'miss') {
      this.div.classList.add('shot-missed');
      this.div.textContent = '•';
    } else if (this.variant === 'wounded') {
      this.div.classList.add('shot-wounded');
    } else if (this.variant === 'killed') {
      this.div.classList.add('shot-wounded', 'shot-killed');
    }

    return true;
  }
}
