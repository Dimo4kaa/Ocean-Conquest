import { Battlefield } from './Battlefield';
import { ShipView } from './ShipView';
import { Shot } from './Shot';
import { isUnderPoint } from './utils';

export class BattlefieldView extends Battlefield {
  root: HTMLDivElement;
  table: HTMLTableElement;
  dock: HTMLDivElement;
  polygon: HTMLDivElement;
  showShips: boolean;

  cells: HTMLTableCellElement[][] = [];

  constructor(showShips = true) {
    super();

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

  addShip(ship: ShipView, x: number, y: number) {
    if (!super.addShip(ship, x, y)) {
      return false;
    }

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

  removeShip(ship: ShipView) {
    if (!super.removeShip(ship)) {
      return false;
    }

    if (Array.prototype.includes.call(this.dock.children, ship.div)) {
      ship.div.remove();
    }

    return true;
  }

  isUnder(point: any) {
    return isUnderPoint(point, this.root);
  }

  addShot(shot: Shot) {
    if (!super.addShot(shot)) {
      return false;
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
    if (!super.removeShot(shot)) {
      return false;
    }

    if (Array.prototype.includes.call(this.polygon.children, shot.div)) {
      shot.div.remove();
    }

    return true;
  }
}
