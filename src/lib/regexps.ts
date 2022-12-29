export const whoIsQuestionRegex = /кто на сервере/i;
export const orQuestionRegex = / или /i;
export const discordTagRegex = /(<@\d{8,}>)/;

export const dhQuestions = [/веса? статов/i];

export function isRegexInText(regex: RegExp | RegExp[], text: string) {
  if (Array.isArray(regex)) {
    for (const rx of regex) {
      if (rx.test(text)) {
        return true;
      }
    }
    return false;
  }
  return regex.test(text);
}

export function isRegexMatched(regex: RegExp, str: string) {
  return str.match(regex);
}
