import { Ship } from './Ship';

export const shipDatas = [
  { size: 4, direction: 'row', startX: 10, startY: 345 },
  { size: 3, direction: 'row', startX: 10, startY: 390 },
  { size: 3, direction: 'row', startX: 120, startY: 390 },
  { size: 2, direction: 'row', startX: 10, startY: 435 },
  { size: 2, direction: 'row', startX: 88, startY: 435 },
  { size: 2, direction: 'row', startX: 167, startY: 435 },
  { size: 1, direction: 'row', startX: 10, startY: 480 },
  { size: 1, direction: 'row', startX: 55, startY: 480 },
  { size: 1, direction: 'row', startX: 100, startY: 480 },
  { size: 1, direction: 'row', startX: 145, startY: 480 },
];

export type matrixItem = {
  x: number;
  y: number;
  ship: Ship | null;
  free: boolean;
  shotted: boolean;
  wounded: boolean;
};

export enum SceneNames {
  Preparation = 'preparation',
  Computer = 'computer',
  Online = 'online',
}

export enum GameDiff {
  Simple = 'simple',
  Middle = 'middle',
  Hard = 'hard',
}
