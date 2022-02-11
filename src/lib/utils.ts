export const consoleLog = (text: string) => {
    const currDate = new Date();
    console.log(
        currDate.getHours() + ':' +
        currDate.getMinutes() + ':' +
        currDate.getSeconds() + ':' +
        ` ${text}`
    );
};

export const randomNum = (min: number, max: number) => {
    return Math.floor(min + Math.random() * (max - min));
};

export const isIncluded = (text: string, substr: string) => {
    return text.includes(substr.toLocaleLowerCase()) || text.includes(substr.toLocaleUpperCase());
};

export const isMatching = (str: string, regexp: RegExp) => str.match(regexp);

export const isTestPassed = (regexp: RegExp, str: string) => regexp.test(str);