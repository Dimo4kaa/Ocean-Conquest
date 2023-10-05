import { io } from '../../../node_modules/socket.io-client/build/esm/index';
import { BattlefieldView } from './BattlefieldView';
import { Mouse } from './Mouse';
import { ShipView } from './ShipView';

export class Application {
  socket: any;
  mouse: Mouse;

  player: BattlefieldView;
  opponent: BattlefieldView;

  //!!!
  scenes: any = {};
  activeScene: any = null;

  constructor(scenes = {}) {
    this.mouse = new Mouse(document.body);
    this.player = new BattlefieldView(true);
    this.opponent = new BattlefieldView(false);
    this.socket = io();

    const { opponent, player, socket } = this;

    document.querySelector('[data-side="player"]')!.append(player.root);
    document.querySelector('[data-side="opponent"]')!.append(opponent.root);

    for (const [sceneName, SceneClass] of Object.entries(scenes)) {
      //!!!
      const SceneClassCopy: any = SceneClass;
      this.scenes[sceneName] = new SceneClassCopy(sceneName, this);
    }

    for (const scene of Object.values(this.scenes)) {
      //!!!
      const sceneCopy: any = scene;
      sceneCopy.init();
    }

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
        const ship = new ShipView(size, direction);
        player.addShip(ship, x, y);
      }

      this.start('online');
    });

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
  start(sceneName: any, ...args: any) {
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
    scene.start(...args);

    return true;
  }
}
