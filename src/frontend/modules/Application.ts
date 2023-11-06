import { io, Socket } from 'socket.io-client';
import { Battlefield } from './Battlefield';
import { Mouse } from './Mouse';
import { PreparationScene } from './scenes/PreparationScene';
import { ComputerScene } from './scenes/ComputerScene';
import { OnlineScene } from './scenes/OnlineScene';
import { matrixItem } from './types';
import { Language } from './Language';
import { gameTranslations, preparationTranslations, statusTranslations } from './translations';

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
    this.socket = io();

    const { opponent, player, socket } = this;

    document.querySelector('[data-side="player"]')!.append(player.root);
    document.querySelector('[data-side="opponent"]')!.append(opponent.root);

    socket.on('playerCount', (n: number) => {
      document.querySelector('[data-playersCount]')!.textContent = String(n);
    });

    const preparationActions = Array.from(
      document.querySelector('[data-scene="preparation"]')!.querySelectorAll('.app-action')!,
    );
    const computerActions = Array.from(
      document.querySelector('[data-scene="computer"]')!.querySelectorAll('.app-action'),
    )!;
    const onlineActions = Array.from(document.querySelector('[data-scene="online"]')!.querySelectorAll('.app-action'))!;

    const staticElements = [...preparationActions, ...computerActions, ...onlineActions];
    const staticTranslations = [...preparationTranslations, ...gameTranslations, ...gameTranslations];

    const computerStatus = document.querySelector('[data-scene="computer"]')!.querySelector('.battlefield-status')!;
    const onlineStatus = document.querySelector('[data-scene="online"]')!.querySelector('.battlefield-status')!;

    const dynamicElements = [computerStatus, onlineStatus];
    const dynamicTranslations = [statusTranslations, statusTranslations];

    this.language = new Language(staticElements, staticTranslations, dynamicElements, dynamicTranslations);

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
  start(sceneName: 'computer', untouchables: matrixItem[]): boolean;
  start(sceneName: 'online', variant: 'random' | 'challenge', key?: string): boolean;
  start(
    sceneName: 'preparation' | 'computer' | 'online',
    arg2?: matrixItem[] | 'random' | 'challenge',
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

    window.localStorage.setItem('shipPlaysing', JSON.stringify(this.player.ships));

    switch (sceneName) {
      case 'preparation':
        (scene as PreparationScene).start();
        break;
      case 'computer':
        (scene as ComputerScene).start(arg2 as matrixItem[]);
        break;
      case 'online':
        (scene as OnlineScene).start(arg2 as string, key);
        break;
    }

    return true;
  }
}
