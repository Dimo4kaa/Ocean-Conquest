import { Application } from './Application';

export class Scene {
  name: string;
  app: Application;

  constructor(name: string, app: Application) {
    this.name = name;
    this.app = app;
  }

  start(...args: any[]) {}

  update(...args: any[]) {}

  stop(...args: any[]) {}
}
