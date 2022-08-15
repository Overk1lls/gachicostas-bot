export const randomNum = (min: number, max: number) => {
  return Math.floor(min + Math.random() * (max - min));
};

export function getRandomArrayElement<T>(array: Array<T>): T {
  return array[randomNum(0, array.length)];
}

export const isSubstrIncluded = (text: string, substr: string) => {
  return text.includes(substr.toLocaleLowerCase()) || text.includes(substr.toLocaleUpperCase());
};
