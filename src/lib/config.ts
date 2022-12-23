import { LogLevel } from '@nestjs/common';

export const isNotProduction = () => {
  return !!process.env.DEBUG || !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';
};

export function getLogCategories(): LogLevel[] {
  return isNotProduction() ? ['debug', 'error', 'log', 'warn'] : ['error', 'warn', 'log'];
}

export default () => ({
  discordToken: process.env.DISCORD_BOT_TOKEN,
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
});
