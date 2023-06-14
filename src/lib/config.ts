import { LogLevel } from '@nestjs/common';
import { JobOptions } from 'bull';

export function isNotProduction() {
  return !!process.env.DEBUG || !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';
}

export function getLogCategories(): LogLevel[] {
  return isNotProduction() ? ['debug', 'error', 'log', 'warn'] : ['error', 'warn', 'log'];
}

export function getBullOptions(): JobOptions {
  return {
    removeOnComplete: true,
    timeout: 5000,
  };
}
