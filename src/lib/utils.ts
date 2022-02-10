export const consoleLog = (text: string) => {
    const currDate = new Date();
    console.log(
        currDate.getHours() + ':' +
        currDate.getMinutes() + ':' +
        currDate.getSeconds() + ':' +
        ` ${text}`
    );
};