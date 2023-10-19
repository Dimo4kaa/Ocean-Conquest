import { Ship } from './Ship.js';

export type matrixItem = {
  x: number;
  y: number;
  ship: Ship | null;
  free: boolean;
  shotted: boolean;
  wounded: boolean;
};

export type shotItem = {
  x: number;
  y: number;
  variant: string;
};
