export function randomNum(min = 0, max = 1) {
  return Math.floor(min + Math.random() * (max - min));
}

export function getRandomArrayElement<T>(array: Array<T>): T {
  return array[randomNum(0, array.length)];
}

export function isStringIncluded(text: string, str: string) {
  return text.includes(str.toLocaleLowerCase()) || text.includes(str.toLocaleUpperCase());
}
