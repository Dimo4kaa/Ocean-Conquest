import { Point } from "./types";

export function getRandomBetween(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function getRandomFrom<T>(...args: T[]): T {
  const index = Math.floor(Math.random() * args.length);
  return args[index];
}

export function isUnderPoint<T extends Point>(point: T, element: HTMLElement) {
  const { left, top, width, height } = element.getBoundingClientRect();
  const { x, y } = point;

  return left <= x && x <= left + width && top <= y && y <= top + height;
}

export function addListener(
  element: Element,
  eventType: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  element.addEventListener(eventType, listener, options);
  return () => element.removeEventListener(eventType, listener, options);
}

export function getRandomSeveral<T>(array: T[] = [], size = 1): T[] {
  array = array.slice();

  if (size > array.length) {
    size = array.length;
  }

  const result = [];

  while (result.length < size) {
    const index = Math.floor(Math.random() * array.length);
    const item = array.splice(index, 1)[0];
    result.push(item);
  }

  return result;
}
