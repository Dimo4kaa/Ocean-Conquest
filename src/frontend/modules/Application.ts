import { io, Socket } from 'socket.io-client';
import { Battlefield } from './Battlefield';
import { Mouse } from './Mouse';
import { PreparationScene } from './scenes/PreparationScene';
import { ComputerScene } from './scenes/ComputerScene';
import { OnlineScene } from './scenes/OnlineScene';
import { MatrixItem } from './types';
import { Language } from './Language';

export class Application {
  socket: Socket;
  mouse: Mouse;
  language: Language;

  player: Battlefield;
  opponent: Battlefield;

  scenes;
  activeScene: PreparationScene | ComputerScene | OnlineScene | null = null;

  constructor() {
    this.mouse = new Mouse(document.body);
    this.player = new Battlefield(true);
    this.opponent = new Battlefield(false);
    this.language = new Language();
    this.socket = io();

    const { opponent, player, socket } = this;

    document.querySelector('[data-side="player"]')!.append(player.root);
    document.querySelector('[data-side="opponent"]')!.append(opponent.root);

    socket.on('playerCount', (n: number) => {
      document.querySelector('[data-playersCount]')!.textContent = String(n);
    });

    this.scenes = {
      preparation: new PreparationScene('preparation', this),
      computer: new ComputerScene('computer', this),
      online: new OnlineScene('online', this),
    };

    requestAnimationFrame(() => this.tick());

    this.start('preparation');
  }

  tick() {
    requestAnimationFrame(() => this.tick());

    if (this.activeScene) {
      this.activeScene.update();
    }

    this.mouse.tick();
  }

  start(sceneName: 'preparation'): boolean;
  start(sceneName: 'computer', untouchables: MatrixItem[]): boolean;
  start(sceneName: 'online', variant: 'random' | 'challenge', key?: string): boolean;
  start(
    sceneName: 'preparation' | 'computer' | 'online',
    arg2?: MatrixItem[] | 'random' | 'challenge',
    key?: string,
  ): boolean {
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
      case 'preparation':
        (scene as PreparationScene).start();
        break;
      case 'computer':
        (scene as ComputerScene).start(arg2 as MatrixItem[]);
        break;
      case 'online':
        (scene as OnlineScene).start(arg2 as string, key);
        break;
    }

    return true;
  }
}
