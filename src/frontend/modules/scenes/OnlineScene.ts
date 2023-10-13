import { Application } from '../Application';
import { Scene } from '../Scene';
import { Shot } from '../Shot';
import { SceneNames } from '../shared';
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

    socket.on('message', (message: string) => {
      const div = document.createElement('div');
      div.classList.add('app-message');
      div.textContent = message;

      const chat = document.querySelector('.app-messages')!;
      chat.insertBefore(div, chat.firstElementChild);
    });

    socket.on('addShot', ({ x, y, variant }) => {
      const shot = new Shot(x, y, variant);

      if (this.ownTurn) {
        this.app.opponent.addShot(shot);
      } else {
        this.app.player.addShot(shot);
      }
    });

    socket.on('setShots', (ownShots, opponentShots) => {
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
      history.pushState(null, '', `/${key}`);
      alert(`Первый кто пройдет по этой ссылки будет играть с вами:\n${location.href}`);
    });

    this.statusUpdate();
  }

  start(variant: string, key = '') {
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

    const chat = document.querySelector('.app-chat')!;
    chat.classList.remove('hidden');

    document.querySelector('.app-messages')!.textContent = '';

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
        this.app.start(SceneNames.Preparation);
      }),
    );

    this.removeEventListeners.push(
      addListener(gaveupButton, 'click', () => {
        socket.emit('gaveup');
        this.app.start(SceneNames.Preparation);
      }),
    );

    this.statusUpdate();
  }

  stop() {
    for (const removeEventListener of this.removeEventListeners) {
      removeEventListener();
    }

    this.removeEventListeners = [];

    document.querySelector('.app-chat')!.classList.add('hidden');
    document.querySelector('.app-messages')!.textContent = '';
  }

  statusUpdate() {
    const statusDiv = this.actionsBar.querySelector('.battlefield-status')!;
    switch (this.status) {
      case '':
        statusDiv.textContent = '';
        break;
      case 'randomFinding':
        statusDiv.textContent = 'Поиск случайного соперника';
        break;
      case 'play':
        statusDiv.textContent = this.ownTurn ? 'Ваш ход' : 'Ход соперника';
        break;
      case 'winner':
        statusDiv.textContent = 'Вы победили';
        break;
      case 'loser':
        statusDiv.textContent = 'Вы проиграли';
        break;
      case 'waiting':
        statusDiv.textContent = 'Ожидаем соперника';
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
