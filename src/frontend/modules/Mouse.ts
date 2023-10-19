export class Mouse {
  element: HTMLElement;

  x!: number;
  y!: number;

  pX!: number;
  pY!: number;

  left = false;
  pLeft = false;

  delta = 0;
  pDelta = 0;

  constructor(element: HTMLElement) {
    this.element = element;

    const update = (e: MouseEvent) => {
      this.x = e.clientX;
      this.y = e.clientY;
      this.delta = 0;
    };

    element.addEventListener('mousemove', (e) => {
      this.tick();
      update(e);
    });

    element.addEventListener('mouseenter', (e) => {
      this.tick();
      update(e);
    });

    element.addEventListener('mouseleave', (e) => {
      this.tick();
      update(e);
    });

    element.addEventListener('mousedown', (e) => {
      this.tick();
      update(e);

      if (e.button === 0) {
        this.left = true;
      }
    });

    element.addEventListener('mouseup', (e) => {
      this.tick();
      update(e);

      if (e.button === 0) {
        this.left = false;
      }
    });

    element.addEventListener('wheel', (e) => {
      this.tick();

      this.x = e.clientX;
      this.y = e.clientY;
      this.delta = e.deltaY > 0 ? 1 : -1;
    });
  }

  tick() {
    this.pX = this.x;
    this.pY = this.y;
    this.pLeft = this.left;
    this.pDelta = this.delta;
    this.delta = 0;
  }
}
