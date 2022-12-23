import { resolve } from 'app-root-path';
import { configure, getLogger, shutdown as loggerShutdown } from 'log4js';

const loggerCategory = 'default';

configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'colored',
      },
    },
    file: {
      type: 'file',
      filename: resolve('./logs/all.log'),
      pattern: 'yyyy-mm-dd',
      daysToKeep: 7,
      backups: 7,
      keepFileExt: true,
      alwaysIncludePattern: false,
      compress: false,
      maxLogSize: 1024 ** 2 * 4,
      layout: {
        type: 'basic',
      },
    },
  },
  categories: {
    [loggerCategory]: {
      appenders: ['console', 'file'],
      level: 'DEBUG',
    },
  },
});

export const logger = getLogger(loggerCategory);
export { loggerShutdown };
