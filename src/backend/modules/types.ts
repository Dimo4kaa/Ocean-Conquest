import { Ship } from './Ship.js';

export type MatrixItem = {
  x: number;
  y: number;
  ship: Ship | null;
  free: boolean;
  shotted: boolean;
  wounded: boolean;
};

export type ShotItem = {
  x: number;
  y: number;
  variant: string;
};

export type Point = {
  x: number;
  y: number;
};