import { Ship } from './Ship.js';
import { Shot } from './Shot.js';
import { MatrixItem, Point } from './types.js';

const angles: Point[] = [
  { x: -1, y: 1 },
  { x: 1, y: 1 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
];

const sides: Point[] = [
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: 0 },
];

export class Battlefield {
  ships: Ship[] = [];
  shots: Shot[] = [];

  get loser() {
    for (const ship of this.ships) {
      if (!ship.killed) {
        return false;
      }
    }

    return true;
  }

  get matrix() {
    const matrix = [];

    for (let y = 0; y < 10; y++) {
      const row = [];

      for (let x = 0; x < 10; x++) {
        const item: MatrixItem = {
          x,
          y,
          ship: null,
          free: true,
          shotted: false,
          wounded: false,
        };

        row.push(item);
      }

      matrix.push(row);
    }

    for (const ship of this.ships) {
      const { x, y } = ship;
      const dx = ship.direction === 'row';
      const dy = ship.direction === 'column';

      for (let i = 0; i < ship.size; i++) {
        const cx = x + Number(dx) * i;
        const cy = y + Number(dy) * i;

        const item = matrix[cy][cx];
        item.ship = ship;
      }

      for (let y = ship.y - 1; y < ship.y + ship.size * Number(dy) + Number(dx) + 1; y++) {
        for (let x = ship.x - 1; x < ship.x + ship.size * Number(dx) + Number(dy) + 1; x++) {
          if (this.inField(x, y)) {
            const item = matrix[y][x];
            item.free = false;
          }
        }
      }
    }

    for (const { x, y } of this.shots) {
      const item = matrix[y][x];
      item.shotted = true;

      if (item.ship) {
        item.wounded = true;
      }
    }

    return matrix;
  }

  inField(x: number, y: number) {
    return 0 <= x && x < 10 && 0 <= y && y < 10;
  }

  addShip(ship: Ship) {
    if (this.ships.includes(ship)) {
      return false;
    }

    this.ships.push(ship);

    return true;
  }

  removeShip(ship: Ship) {
    if (!this.ships.includes(ship)) {
      return false;
    }

    const index = this.ships.indexOf(ship);
    this.ships.splice(index, 1);

    return true;
  }

  removeAllShips() {
    const ships = this.ships.slice();

    for (const ship of ships) {
      this.removeShip(ship);
    }

    return ships.length;
  }

  addShot(shot: Shot) {
    for (const { x, y } of this.shots) {
      if (x === shot.x && y === shot.y) {
        return false;
      }
    }

    this.shots.push(shot);

    const matrix = this.matrix;
    const { x, y } = shot;

    if (matrix[y][x].ship) {
      shot.setVariant('wounded');

      for (const angle of angles) {
        const aX = x + angle.x;
        const aY = y + angle.y;
        if (this.inField(aX, aY)) {
          const shot = new Shot(aX, aY);
          shot.setVariant('miss');
          this.addShot(shot);
        }
      }

      const ship = matrix[y][x].ship!;
      const dx = ship.direction === 'row';
      const dy = ship.direction === 'column';

      let killed = true;

      for (let i = 0; i < ship.size; i++) {
        const cx = ship.x + Number(dx) * i;
        const cy = ship.y + Number(dy) * i;
        const item = matrix[cy][cx];

        if (!item.wounded) {
          killed = false;
          break;
        }
      }

      if (killed) {
        ship.killed = true;

        for (let i = 0; i < ship.size; i++) {
          const cx = ship.x + Number(dx) * i;
          const cy = ship.y + Number(dy) * i;

          if (i === 0 || i === ship.size - 1) {
            for (const side of sides) {
              const sX = cx + side.x;
              const sY = cy + side.y;
              if (this.inField(sX, sY)) {
                const shot = new Shot(sX, sY);
                shot.setVariant('miss');
                this.addShot(shot);
              }
            }
          }

          const shot = this.shots.find((shot) => shot.x === cx && shot.y === cy)!;
          shot.setVariant('killed');
        }
      }
    }

    return true;
  }

  removeShot(shot: Shot) {
    if (!this.shots.includes(shot)) {
      return false;
    }

    const index = this.shots.indexOf(shot);
    this.shots.splice(index, 1);

    return true;
  }

  removeAllShots() {
    const shots = this.shots.slice();

    for (const shot of shots) {
      this.removeShot(shot);
    }

    return shots.length;
  }

  clear() {
    this.removeAllShots();
    this.removeAllShips();
  }
}
