import { io, Socket } from 'socket.io-client';
import { Battlefield } from './Battlefield';
import { Mouse } from './Mouse';
import { Ship } from './Ship';
import { PreparationScene } from './scenes/PreparationScene';
import { ComputerScene } from './scenes/ComputerScene';
import { OnlineScene } from './scenes/OnlineScene';

export class Application {
  //!!!
  socket: Socket;
  mouse: Mouse;

  player: Battlefield;
  opponent: Battlefield;

  scenes
  activeScene: any = null;

  constructor() {
    this.mouse = new Mouse(document.body);
    this.player = new Battlefield(true);
    this.opponent = new Battlefield(false);
    this.socket = io();

    const { scenes, opponent, player, socket } = this;

    document.querySelector('[data-side="player"]')!.append(player.root);
    document.querySelector('[data-side="opponent"]')!.append(opponent.root);

    socket.on('playerCount', (n: any) => {
      document.querySelector('[data-playersCount]')!.textContent = n;
    });

    socket.on('doubleConnection', () => {
      alert('Socket соединение закрыто из-за подключения в другой вкладке.');
      document.body.classList.add('hidden');
    });

    socket.on('reconnection', (ships: any) => {
      player.clear();

      for (const { size, direction, x, y } of ships) {
        const ship = new Ship(size, direction);
        player.addShip(ship, x, y);
      }

      this.start('online');
    });

    this.scenes = {
      preparation: new PreparationScene('preparation', this),
      computer: new ComputerScene('computer', this),
      online: new OnlineScene('online', this),
    };

    requestAnimationFrame(() => this.tick());
  }

  tick() {
    requestAnimationFrame(() => this.tick());

    if (this.activeScene) {
      this.activeScene.update();
    }

    this.mouse.tick();
  }

  //!!!
  start(sceneName: string, ...args: any) {
    //если запускаем туже сцену
    if (this.activeScene && this.activeScene.name === sceneName) {
      return false;
    }
    //если такой сцены нет
    if (!this.scenes.hasOwnProperty(sceneName)) {
      return false;
    }
    //если есть какая-тто активная сцена, то остановливаем её
    if (this.activeScene) {
      this.activeScene.stop();
    }

    const scene = this.scenes[sceneName];
    this.activeScene = scene;
    scene.start(...args);

    return true;
  }
}
