import { Application } from '../Application';
import { Scene } from '../Scene';
import { Shot } from '../Shot';
import { statusTranslations } from '../translations';
import { shotItem } from '../types';
import { addListener, isUnderPoint } from '../utils';

export class OnlineScene extends Scene {
  actionsBar: HTMLDivElement;
  status = '';
  ownTurn = false;

  removeEventListeners: (() => void)[] = [];

  constructor(name: string, app: Application) {
    super(name, app);
    this.actionsBar = document.querySelector('[data-scene="online"]')!;

    const { socket, player, opponent } = this.app;

    socket.on('statusChange', (status: string) => {
      this.status = status;
      this.statusUpdate();
    });

    socket.on('turnUpdate', (ownTurn: boolean) => {
      this.ownTurn = ownTurn;
      this.statusUpdate();
    });

    socket.on('setShots', (ownShots: shotItem[], opponentShots: shotItem[]) => {
      player.removeAllShots();

      for (const { x, y, variant } of ownShots) {
        const shot = new Shot(x, y, variant);
        player.addShot(shot);
      }

      opponent.removeAllShots();

      for (const { x, y, variant } of opponentShots) {
        const shot = new Shot(x, y, variant);
        opponent.addShot(shot);
      }
    });

    socket.on('challengeOpponent', (key) => {
      alert(`${this.app.language.getTranslate(statusTranslations, 'challengeOpponent')}: ${key}`);
    });

    this.statusUpdate();
  }

  start(variant: string, key = '') {
    this.status = '';
    const { socket, player } = this.app;

    socket.emit(
      'shipSet',
      player.ships.map((ship) => ({
        size: ship.size,
        direction: ship.direction,
        x: ship.x,
        y: ship.y,
      })),
    );

    if (variant === 'random') {
      socket.emit('findRandomOpponent');
    } else if (variant === 'challenge') {
      socket.emit('challengeOpponent', key);
    }

    document.querySelectorAll('.app-actions').forEach((element) => element.classList.add('hidden'));

    const sceneActionsBar = document.querySelector('[data-scene="online"]')!;
    sceneActionsBar.classList.remove('hidden');

    const againButton = sceneActionsBar.querySelector('[data-action="again"]')!;
    const gaveupButton = sceneActionsBar.querySelector('[data-action="gaveup"]')!;

    againButton.classList.add('hidden');
    gaveupButton.classList.remove('hidden');

    this.removeEventListeners = [];

    this.removeEventListeners.push(
      addListener(againButton, 'click', () => {
        this.app.start('preparation');
      }),
    );

    this.removeEventListeners.push(
      addListener(gaveupButton, 'click', () => {
        socket.emit('gaveup');
        this.app.start('preparation');
      }),
    );

    this.statusUpdate();
  }

  stop() {
    for (const removeEventListener of this.removeEventListeners) {
      removeEventListener();
    }

    this.removeEventListeners = [];
  }

  statusUpdate() {
    const statusDiv = this.actionsBar.querySelector('.battlefield-status')!;
    const { language } = this.app;

    switch (this.status) {
      case '':
        statusDiv.textContent = '';
        break;
      case 'randomFinding':
        statusDiv.textContent = language.getTranslate(statusTranslations, 'randomFinding');
        break;
      case 'play':
        statusDiv.textContent = this.ownTurn
          ? language.getTranslate(statusTranslations, 'yourMove')
          : language.getTranslate(statusTranslations, 'oppMove');
        break;
      case 'winner':
        statusDiv.textContent = language.getTranslate(statusTranslations, 'winner');
        break;
      case 'loser':
        statusDiv.textContent = language.getTranslate(statusTranslations, 'loser');
        break;
      case 'waiting':
        statusDiv.textContent = language.getTranslate(statusTranslations, 'waiting');
        break;
    }
  }

  update() {
    const { mouse, opponent, player, socket } = this.app;

    const cells = opponent.cells.flat();
    cells.forEach((x) => x.classList.remove('battlefield-item__active'));

    if (['loser', 'winner'].includes(this.status)) {
      const sceneActionsBar = document.querySelector('[data-scene="online"]')!;

      const againButton = sceneActionsBar.querySelector('[data-action="again"]')!;
      const gaveupButton = sceneActionsBar.querySelector('[data-action="gaveup"]')!;

      againButton.classList.remove('hidden');
      gaveupButton.classList.add('hidden');
    }

    if (player.loser) {
      return;
    }

    if (isUnderPoint(mouse, opponent.root)) {
      const cell = opponent.cells.flat().find((cell) => isUnderPoint(mouse, cell));

      if (cell) {
        cell.classList.add('battlefield-item__active');

        if (mouse.left && !mouse.pLeft) {
          const x = Number(cell.dataset.x!);
          const y = Number(cell.dataset.y!);

          socket.emit('addShot', x, y);
        }
      }
    }
  }
}
