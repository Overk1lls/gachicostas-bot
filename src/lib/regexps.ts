export const questionRegexps = {
  whoIsOnServer: /кто на сервере/i,
  whatStatWeights: /веса? статов/i,
  whatLegendary: /(какие легендарки)|(какая легендарка)/i,
  whatCovenant: /(какие ковенанты)|(какой ковенант)/i,
};

export const regexps = {
  discordTag: /(<@!\d{8,}>)/,
  or: /или/i,
};

export const dhQuestions = [
  questionRegexps.whatCovenant,
  questionRegexps.whatLegendary,
  questionRegexps.whatStatWeights,
];

export const isRegexInText = (regex: RegExp | RegExp[], text: string): boolean => {
  if (Array.isArray(regex)) {
    for (const regexp of regex) {
      if (regexp.test(text)) {
        return true;
      }
    }
    return false;
  }
  return regex.test(text);
};

export const isStringMatchingRegex = (str: string, regex: RegExp) => {
  return str.match(regex);
};
