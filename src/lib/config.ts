import { resolve } from 'app-root-path';
import { config as loadConfig } from 'dotenv';

export interface Config {
  discordBotToken: string;
  logLevel: string;
}

export const isNotProduction = () => {
  return !!process.env.DEBUG || !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';
};

const envConfig = loadConfig({
  path: resolve('./config/.env'),
  debug: isNotProduction(),
});

const loadError = envConfig.error as NodeJS.ErrnoException;
if (loadError) {
  if (loadError.code === 'ENOENT' || loadError.code === 'EACCES') {
    console.info(`Failed to load config from file "${loadError.path}": ${loadError.code}`);
  } else {
    console.warn('Unknown config file loading errors', loadError);
  }
}

const getConfig = (): Config => {
  const key = 'DISCORD_BOT_TOKEN';
  const discordBotToken = process.env[key];
  if (!discordBotToken) {
    throw new Error(`The environment variable '${key}' is missing!`);
  }

  return {
    discordBotToken,
    logLevel: process.env['LOG_LEVEL'] || (isNotProduction() ? 'DEBUG' : 'WARN'),
  };
};

export const config = getConfig();
