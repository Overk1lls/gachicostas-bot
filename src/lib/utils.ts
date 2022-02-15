export const consoleLog = (text: string) => {
    const currDate = new Date();
    console.log(`${currDate.getHours()}:${currDate.getMinutes()} ${text}`);
};

export const randomNum = (min: number, max: number) => {
    return Math.floor(min + Math.random() * (max - min));
};

export const isSubstrIncluded = (text: string, substr: string) => {
    return text.includes(substr.toLocaleLowerCase()) || text.includes(substr.toLocaleUpperCase());
};

export const isMatching = (str: string, regexp: RegExp) => str.match(regexp);

export const isRegexInText = (regexp: RegExp, str: string) => regexp.test(str);

export const isOneRegexInText = (regexps: RegExp[], text: string) => {
    for (const regexp of regexps) {
        if (regexp.test(text)) {
            return true;
        }
    }
    return false;
};

export const getRandomElement = (array: any[]) => {
    return array[randomNum(0, array.length)];
};