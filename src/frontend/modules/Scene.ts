import { Application } from './Application';

export abstract class Scene {
  name: string;
  app: Application;

  constructor(name: string, app: Application) {
    this.name = name;
    this.app = app;
  }

  abstract start(...args: any[]): void

  abstract update(...args: any[]): void

  abstract stop(...args: any[]): void
}
