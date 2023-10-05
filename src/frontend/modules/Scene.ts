import { Application } from './Application';

export class Scene {
  name: string;
  app: Application;

  constructor(name: string, app: Application) {
    this.name = name;
    this.app = app;
  }

  init() {}

  start() {}

  update() {}

  stop() {}
}
