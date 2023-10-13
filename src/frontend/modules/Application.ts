import { io, Socket } from 'socket.io-client';
import { Battlefield } from './Battlefield';
import { Mouse } from './Mouse';
import { PreparationScene } from './scenes/PreparationScene';
import { ComputerScene } from './scenes/ComputerScene';
import { OnlineScene } from './scenes/OnlineScene';
import { matrixItem, SceneNames } from './shared';

export class Application {
  socket: Socket;
  mouse: Mouse;

  player: Battlefield;
  opponent: Battlefield;

  scenes;
  activeScene: PreparationScene | ComputerScene | OnlineScene | null = null;

  constructor() {
    this.mouse = new Mouse(document.body);
    this.player = new Battlefield(true);
    this.opponent = new Battlefield(false);
    this.socket = io();

    const { opponent, player, socket } = this;

    document.querySelector('[data-side="player"]')!.append(player.root);
    document.querySelector('[data-side="opponent"]')!.append(opponent.root);

    socket.on('playerCount', (n: any) => {
      document.querySelector('[data-playersCount]')!.textContent = n;
    });

    socket.on('doubleConnection', () => {
      alert('Socket соединение закрыто из-за подключения в другой вкладке.');
      document.body.classList.add('hidden');
    });

    this.scenes = {
      preparation: new PreparationScene('preparation', this),
      computer: new ComputerScene('computer', this),
      online: new OnlineScene('online', this),
    };

    requestAnimationFrame(() => this.tick());

    this.start(SceneNames.Preparation);
  }

  tick() {
    requestAnimationFrame(() => this.tick());

    if (this.activeScene) {
      this.activeScene.update();
    }

    this.mouse.tick();
  }

  start(sceneName: SceneNames): boolean;
  start(sceneName: SceneNames, untouchables: matrixItem[]): boolean;
  start(sceneName: SceneNames, variant: string, key?: string): boolean;
  start(sceneName: SceneNames, arg2?: matrixItem[] | string, key?: string): boolean {
    if (this.activeScene && this.activeScene.name === sceneName) {
      return false;
    }
    if (!this.scenes.hasOwnProperty(sceneName)) {
      return false;
    }
    if (this.activeScene) {
      this.activeScene.stop();
    }

    const scene = this.scenes[sceneName];
    this.activeScene = scene;

    switch (sceneName) {
      case SceneNames.Preparation:
        (scene as PreparationScene).start();
        break;
      case SceneNames.Computer:
        (scene as ComputerScene).start(arg2 as matrixItem[]);
        break;
      case SceneNames.Online:
        (scene as OnlineScene).start(arg2 as string, key);
        break;
    }

    return true;
  }
}
