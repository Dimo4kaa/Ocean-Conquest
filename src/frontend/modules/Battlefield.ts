import { Ship } from './Ship';
import { Shot } from './Shot';
import { getRandomBetween, getRandomFrom, isUnderPoint } from './utils';

export class Battlefield {
  ships: Ship[] = [];
  shots: Shot[] = [];
  //TYPES
  _private_matrix: any = null;
  _private_changed: any = true;

  root: HTMLDivElement;
  table: HTMLTableElement;
  dock: HTMLDivElement;
  polygon: HTMLDivElement;
  showShips: boolean;

  cells: HTMLTableCellElement[][] = [];

  constructor(showShips = true) {
    this.root = document.createElement('div');
    this.table = document.createElement('table');
    this.dock = document.createElement('div');
    this.polygon = document.createElement('div');
    this.showShips = showShips;

    const { root, table, dock, polygon } = this;

    root.classList.add('battlefield');
    table.classList.add('battlefield-table');
    dock.classList.add('battlefield-dock');
    polygon.classList.add('battlefield-polygon');

    root.append(table, dock, polygon);

    for (let y = 0; y < 10; y++) {
      const row: HTMLTableCellElement[] = [];
      const tr = document.createElement('tr');
      tr.classList.add('battlefield-row');
      tr.dataset.y = String(y);

      for (let x = 0; x < 10; x++) {
        const td = document.createElement('td');
        td.classList.add('battlefield-item');
        Object.assign(td.dataset, { x, y });

        tr.append(td);
        row.push(td);
      }

      table.append(tr);
      this.cells.push(row);
    }

    for (let x = 0; x < 10; x++) {
      const cell = this.cells[0][x];
      const marker = document.createElement('div');

      marker.classList.add('marker', 'marker-column');
      marker.textContent = 'АБВГДЕЖЗИК'[x];

      cell.append(marker);
    }

    for (let y = 0; y < 10; y++) {
      const cell = this.cells[y][0];
      const marker = document.createElement('div');

      marker.classList.add('marker', 'marker-row');
      marker.textContent = String(y + 1);

      cell.append(marker);
    }
  }

  get loser() {
    for (const ship of this.ships) {
      if (!ship.killed) {
        return false;
      }
    }

    return true;
  }

  get matrix() {
    if (!this._private_changed) {
      this._private_matrix;
    }

    const matrix = [];

    for (let y = 0; y < 10; y++) {
      const row = [];

      for (let x = 0; x < 10; x++) {
        //!!!
        const item: any = {
          x,
          y,
          ship: null,
          free: true,

          shoted: false,
          wounded: false,
        };

        row.push(item);
      }

      matrix.push(row);
    }

    for (const ship of this.ships) {
      if (!ship.placed) {
        continue;
      }

      const { x, y } = ship;
      const dx = ship.direction === 'row';
      const dy = ship.direction === 'column';

      for (let i = 0; i < ship.size; i++) {
        //!!!
        const cx = x + dx * i;
        const cy = y + dy * i;

        const item = matrix[cy][cx];
        item.ship = ship;
      }

      //!!! Ship x и Ship y
      for (let y = ship.y - 1; y < ship.y + ship.size * dy + dx + 1; y++) {
        for (let x = ship.x - 1; x < ship.x + ship.size * dx + dy + 1; x++) {
          if (this.inField(x, y)) {
            const item = matrix[y][x];
            item.free = false;
          }
        }
      }
    }

    for (const { x, y } of this.shots) {
      const item = matrix[y][x];
      item.shoted = true;

      if (item.ship) {
        item.wounded = true;
      }
    }

    this._private_matrix = matrix;
    this._private_changed = false;

    return this._private_matrix;
  }

  get complete() {
    if (this.ships.length !== 10) {
      return false;
    }

    for (const ship of this.ships) {
      if (!ship.placed) {
        return false;
      }
    }

    return true;
  }

  addShip(ship: Ship, x: number, y: number) {
    this.ships.push(ship);

    if (this.inField(x, y)) {
      const dx = ship.direction === 'row';
      const dy = ship.direction === 'column';

      let placed = true;

      for (let i = 0; i < ship.size; i++) {
        //!!!
        const cx = x + dx * i;
        const cy = y + dy * i;

        if (!this.inField(cx, cy)) {
          placed = false;
          break;
        }

        const item = this.matrix[cy][cx];
        if (!item.free) {
          placed = false;
          break;
        }
      }

      if (placed) {
        Object.assign(ship, { x, y });
      }
    }

    this._private_changed = true;

    if (this.showShips) {
      this.dock.append(ship.div);

      if (ship.placed) {
        const cell = this.cells[y][x];
        const cellRect = cell.getBoundingClientRect();
        const rootRect = this.root.getBoundingClientRect();

        ship.div.style.left = `${cellRect.left - rootRect.left}px`;
        ship.div.style.top = `${cellRect.top - rootRect.top}px`;
      } else {
        ship.setDirection('row');
        ship.div.style.left = `${ship.startX}px`;
        ship.div.style.top = `${ship.startY}px`;
      }
    }

    return true;
  }

  removeShip(ship: Ship) {
    //???
    if (!this.ships.includes(ship)) {
      return false;
    }

    ship.x = null;
    ship.y = null;

    this._private_changed = true;

    const index = this.ships.indexOf(ship);
    this.ships.splice(index, 1);

    if (Array.prototype.includes.call(this.dock.children, ship.div)) {
      ship.div.remove();
    }

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
    this._private_changed = true;

    const matrix = this.matrix;
    const { x, y } = shot;

    if (matrix[y][x].ship) {
      shot.setVariant('wounded');

      const { ship } = matrix[y][x];
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

          const shot = this.shots.find((shot) => shot.x === cx && shot.y === cy);
          shot!.setVariant('killed');
        }
      }
    }

    const cell = this.cells[shot.y][shot.x];
    const cellRect = cell.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();

    shot.div.style.left = `${cellRect.left - rootRect.left}px`;
    shot.div.style.top = `${cellRect.top - rootRect.top}px`;

    this.polygon.append(shot.div);

    return true;
  }

  removeShot(shot: Shot) {
    //???
    if (!this.shots.includes(shot)) {
      return false;
    }

    const index = this.shots.indexOf(shot);
    this.shots.splice(index, 1);

    this._private_changed = true;

    if (Array.prototype.includes.call(this.polygon.children, shot.div)) {
      shot.div.remove();
    }

    return true;
  }

  removeAllShots() {
    const shots = this.shots.slice();

    for (const shot of shots) {
      this.removeShot(shot);
    }

    return shots.length;
  }

  //!!!???
  randomize(ShipClass: any = Ship) {
    this.removeAllShips();

    for (let size = 4; size >= 1; size--) {
      for (let n = 0; n < 5 - size; n++) {
        const direction = getRandomFrom('row', 'column');
        //!!!
        const ship: any = new ShipClass(size, direction);

        while (!ship.placed) {
          const x = getRandomBetween(0, 9);
          const y = getRandomBetween(0, 9);

          this.removeShip(ship);
          this.addShip(ship, x, y);
        }
      }
    }
  }

  clear() {
    this.removeAllShots();
    this.removeAllShips();
  }

  isUnder(point: any) {
    return isUnderPoint(point, this.root);
  }

  inField(x: any, y: any) {
    const isNumber = (n: any) => parseInt(n) === n && !isNaN(n) && ![Infinity, -Infinity].includes(n);

    if (!isNumber(x) || !isNumber(y)) {
      return false;
    }

    return 0 <= x && x < 10 && 0 <= y && y < 10;
  }
}
