export type matrixItem = {
  x: number;
  y: number;
  ship: Ship | null;
  free: boolean;
  shotted: boolean;
  wounded: boolean;
};
