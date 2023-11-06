import { Application } from '../Application';
import { Scene } from '../Scene';
import { Ship } from '../Ship';
import { matrixItem } from '../types';
import { addListener, getRandomSeveral, isUnderPoint } from '../utils';

const shipDatas = [
  { size: 4, direction: 'row', startX: 10, startY: 345 },
  { size: 3, direction: 'row', startX: 10, startY: 390 },
  { size: 3, direction: 'row', startX: 120, startY: 390 },
  { size: 2, direction: 'row', startX: 10, startY: 435 },
  { size: 2, direction: 'row', startX: 88, startY: 435 },
  { size: 2, direction: 'row', startX: 167, startY: 435 },
  { size: 1, direction: 'row', startX: 10, startY: 480 },
  { size: 1, direction: 'row', startX: 55, startY: 480 },
  { size: 1, direction: 'row', startX: 100, startY: 480 },
  { size: 1, direction: 'row', startX: 145, startY: 480 },
];

export class PreparationScene extends Scene {
  draggedShip: Ship | null = null;
  draggedOffsetX = 0;
  draggedOffsetY = 0;

  removeEventListeners: (() => void)[] = [];

  constructor(name: string, app: Application) {
    super(name, app);

    const ships = window.localStorage.getItem('shipPlaysing');
    if (ships) {
      const parsedShips: Ship[] = JSON.parse(ships);
      for (const { size, direction, startX, startY, x, y } of parsedShips) {
        const ship = new Ship(size, direction, startX, startY);
        console.log(ship);
        this.app.player.addShip(ship, x!, y!);
      }
    } else {
      this.manually();
    }

    const { language } = this.app;
    const langUl = document.querySelector('.lang')!;
    const backdrop = document.querySelector('.backdrop')!;

    langUl.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('lang__li_selected') && langUl.classList.contains('lang_opened')) {
        this.closeLangUl();
        return;
      }
      if (target.classList.contains('lang__li_selected') && !langUl.classList.contains('lang_opened')) {
        this.openLangUl();
        return;
      }
      if (target.classList.contains('lang__li') && !target.classList.contains('lang__li_selected')) {
        const selected = langUl.querySelector('.lang__li_selected')!;
        selected.classList.remove('lang__li_selected');
        target.classList.add('lang__li_selected');

        const lang = target.dataset.lang!;
        window.localStorage.setItem('lang', lang);
        language.changeLanguage(lang);
        this.closeLangUl();
        return;
      }
    });

    backdrop.addEventListener('click', () => {
      this.closeLangUl();
    });

    let startLang = window.localStorage.getItem('lang');
    if (!startLang) {
      startLang = navigator.language.slice(0, 2);
    }

    const firstLangElement = document.querySelector(`[data-lang=${startLang}]`) as HTMLLIElement | null;
    if (firstLangElement) {
      firstLangElement.classList.add('lang__li_selected');
      language.changeLanguage(startLang);
    } else {
      document.querySelector('[data-lang="en"]')!.classList.add('lang__li_selected');
      language.changeLanguage('en');
    }

    let isDark = window.localStorage.getItem('theme');
    if (isDark === 'dark') {
      this.switchTheme();
    }
    const theme = document.querySelector('.theme')!;
    theme.addEventListener('click', () => this.switchTheme());
  }

  start() {
    const { player, opponent } = this.app;

    opponent.clear();
    player.removeAllShots();
    player.ships.forEach((ship) => (ship.killed = false));

    this.removeEventListeners = [];

    document.querySelectorAll('.app-actions').forEach((element) => element.classList.add('hidden'));

    document.querySelector('[data-scene="preparation"]')!.classList.remove('hidden');

    const manuallyButton = document.querySelector('[data-action="manually"]')!;
    const randomizeButton = document.querySelector('[data-action="randomize"]')!;
    const simpleButton = document.querySelector('[data-computer="simple"]')!;
    const middleButton = document.querySelector('[data-computer="middle"]')!;
    const hardButton = document.querySelector('[data-computer="hard"]')!;
    const randomButton = document.querySelector('[data-type="random"]')!;
    const challengeButton = document.querySelector('[data-type="challenge"]')!;
    const takeChallengeButton = document.querySelector('[data-type="takeChallenge"]')!;

    this.removeEventListeners.push(addListener(manuallyButton, 'click', () => this.manually()));

    this.removeEventListeners.push(addListener(randomizeButton, 'click', () => this.randomize()));

    this.removeEventListeners.push(addListener(simpleButton, 'click', () => this.startComputer('simple')));

    this.removeEventListeners.push(addListener(middleButton, 'click', () => this.startComputer('middle')));

    this.removeEventListeners.push(addListener(hardButton, 'click', () => this.startComputer('hard')));

    this.removeEventListeners.push(addListener(randomButton, 'click', () => this.app.start('online', 'random')));

    this.removeEventListeners.push(addListener(challengeButton, 'click', () => this.app.start('online', 'challenge')));

    this.removeEventListeners.push(
      addListener(takeChallengeButton, 'click', () => {
        const key = String(prompt('Ключ партии:'));
        this.app.start('online', 'challenge', key);
      }),
    );
  }

  stop() {
    for (const removeEventListener of this.removeEventListeners) {
      removeEventListener();
    }

    this.removeEventListeners = [];
  }

  update() {
    const { mouse, player } = this.app;

    if (!this.draggedShip && mouse.left && !mouse.pLeft) {
      const ship = player.ships.find((ship) => isUnderPoint(mouse, ship.div));

      if (ship) {
        const shipRect = ship.div.getBoundingClientRect();

        this.draggedShip = ship;
        this.draggedOffsetX = mouse.x - shipRect.left;
        this.draggedOffsetY = mouse.y - shipRect.top;

        ship.x = null;
        ship.y = null;
      }
    }

    if (mouse.left && this.draggedShip) {
      const { left, top } = player.root.getBoundingClientRect();
      const x = mouse.x - this.draggedOffsetX;
      const y = mouse.y - this.draggedOffsetY;

      const ship = this.draggedShip;
      const shipRect = ship.div.getBoundingClientRect();
      const { width, height } = player.cells[0][0].getBoundingClientRect();

      const point = {
        x: x + width / 2,
        y: y + height / 2,
      };

      const cell = player.cells.flat().find((cell) => isUnderPoint(point, cell));
      if (cell) {
        const cellX = Number(cell!.dataset.x);
        const cellY = Number(cell!.dataset.y);
        const matrix = this.app.player.matrix;

        const dx = ship.direction === 'row';
        const dy = ship.direction === 'column';

        let isFree = true;

        for (let i = 0; i < ship.size; i++) {
          const cx = cellX + Number(dx) * i;
          const cy = cellY + Number(dy) * i;
          if (cx > 9 || cy > 9) {
            isFree = false;
            break;
          }
          const item = matrix[cy][cx];
          if (!item.free) {
            isFree = false;
            break;
          }
        }

        if (isFree) {
          ship.div.classList.add('ship_dragPlaced');
          const cellRect = cell.getBoundingClientRect();
          this.draggedShip.div.style.left = `${cellRect.left - left}px`;
          this.draggedShip.div.style.top = `${cellRect.top - top}px`;
        } else {
          ship.div.classList.remove('ship_dragPlaced');
          this.draggedShip.div.style.left = `${x - left}px`;
          this.draggedShip.div.style.top = `${y - top}px`;
        }
      } else {
        ship.div.classList.remove('ship_dragPlaced');
        this.draggedShip.div.style.left = `${x - left}px`;
        this.draggedShip.div.style.top = `${y - top}px`;
      }
    }

    if (!mouse.left && this.draggedShip) {
      const ship = this.draggedShip;
      this.draggedShip = null;

      const { left, top } = ship.div.getBoundingClientRect();
      const { width, height } = player.cells[0][0].getBoundingClientRect();

      const point = {
        x: left + width / 2,
        y: top + height / 2,
      };

      const cell = player.cells.flat().find((cell) => isUnderPoint(point, cell));

      if (cell) {
        const x = Number(cell.dataset.x!);
        const y = Number(cell.dataset.y!);

        player.removeShip(ship);
        player.addShip(ship, x, y);
        ship.div.classList.remove('ship_dragPlaced');
      } else {
        player.removeShip(ship);
        player.addShip(ship);
      }
    }

    if (this.draggedShip && mouse.delta) {
      this.draggedShip.toggleDirection();
    }

    if (player.complete) {
      (document.querySelector('[data-computer="simple"]') as HTMLButtonElement).disabled = false;
      (document.querySelector('[data-computer="middle"]') as HTMLButtonElement).disabled = false;
      (document.querySelector('[data-computer="hard"]') as HTMLButtonElement).disabled = false;
      (document.querySelector('[data-type="random"]') as HTMLButtonElement).disabled = false;
      (document.querySelector('[data-type="challenge"]') as HTMLButtonElement).disabled = false;
      (document.querySelector('[data-type="takeChallenge"]') as HTMLButtonElement).disabled = false;
    } else {
      (document.querySelector('[data-computer="simple"]') as HTMLButtonElement).disabled = true;
      (document.querySelector('[data-computer="middle"]') as HTMLButtonElement).disabled = true;
      (document.querySelector('[data-computer="hard"]') as HTMLButtonElement).disabled = true;
      (document.querySelector('[data-type="random"]') as HTMLButtonElement).disabled = true;
      (document.querySelector('[data-type="challenge"]') as HTMLButtonElement).disabled = true;
      (document.querySelector('[data-type="takeChallenge"]') as HTMLButtonElement).disabled = true;
    }
  }

  openLangUl() {
    document.querySelector('.lang')!.classList.add('lang_opened');
    document.querySelector('.backdrop')!.classList.add('backdrop__opened');
  }

  closeLangUl() {
    document.querySelector('.lang')!.classList.remove('lang_opened');
    document.querySelector('.backdrop')!.classList.remove('backdrop__opened');
  }

  switchTheme() {
    const theme = document.querySelector('.theme')!;
    theme.classList.toggle('theme_dark');
    document.body.classList.toggle('dark-theme');
    if (theme.classList.contains('theme_dark')) {
      window.localStorage.setItem('theme', 'dark');
    } else {
      window.localStorage.setItem('theme', 'white');
    }
  }

  randomize() {
    const { player } = this.app;
    player.randomize();

    for (let i = 0; i < 10; i++) {
      const ship = player.ships[i];

      ship.startX = shipDatas[i].startX;
      ship.startY = shipDatas[i].startY;
    }
  }

  manually() {
    const { player } = this.app;

    player.removeAllShips();

    for (const { size, direction, startX, startY } of shipDatas) {
      const ship = new Ship(size, direction, startX, startY);
      player.addShip(ship);
    }
  }

  startComputer(level: 'simple' | 'middle' | 'hard') {
    const matrix = this.app.player.matrix;
    const freeCells = matrix.flat().filter((item) => item.free);
    let untouchables: matrixItem[] = [];

    if (level === 'simple') {
    } else if (level === 'middle') {
      untouchables = getRandomSeveral(freeCells, 5);
    } else if (level === 'hard') {
      untouchables = getRandomSeveral(freeCells, 10);
    }
    this.app.start('computer', untouchables);
  }
}
