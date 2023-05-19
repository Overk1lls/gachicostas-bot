export function randomNum(min = 0, max = 1) {
  return Math.floor(min + Math.random() * (max - min));
}

export function getRandomArrayElement<T>(array: Array<T>): T {
  return array[randomNum(0, array.length)];
}

export function isStringIncluded(text: string, str: string) {
  return text.includes(str.toLocaleLowerCase()) || text.includes(str.toLocaleUpperCase());
}

interface SplitOptions {
  maxLength?: number;
  char?: string;
  prepend?: string;
  append?: string;
}

export function splitMessage(text: string, options?: SplitOptions) {
  const maxLength = options?.maxLength ?? 2000;
  const char = options?.char ?? '\n';
  const prepend = options?.prepend ?? '';
  const append = options?.append ?? '';
  if (text.length <= maxLength) {
    return [text];
  }

  const splitText = text.split(char);
  if (splitText.some((t) => t.length > maxLength)) {
    throw new Error('splitMessage: split maximum length exceeded');
  }

  const chunks = [];
  let msg = '';
  for (const chunk of splitText) {
    if (msg && (msg + char + chunk + append).length > maxLength) {
      msg.trimStart();
      chunks.push(msg + append);
      msg = prepend;
    }
    msg += (msg && msg !== prepend ? char : '') + chunk;
  }
  return chunks.concat(msg).filter(m => m);
}
