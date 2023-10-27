const alphabet = '0123456789qazxswedcvfrtgbnhyujmkioplQAZXSWEDCVFRTGBNHYUJMKIOPL';

export function getRandomString(size = 10) {
  let string = '';

  while (string.length < size) {
    string += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return string;
}

export function getRandomFrom<T>(...args: T[]): T {
  const index = Math.floor(Math.random() * args.length);
  return args[index];
}
