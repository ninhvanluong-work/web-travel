import * as Sentry from '@sentry/nextjs';

type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug';
type SentrySeverity = 'fatal' | 'error' | 'warning' | 'info';

const isDev = process.env.NODE_ENV === 'development';

function isDebugMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('debug');
}

const SENTRY_LEVEL: Record<Exclude<LogLevel, 'debug'>, SentrySeverity> = {
  fatal: 'fatal',
  error: 'error',
  warn: 'warning',
  info: 'info',
};

function consoleFn(level: LogLevel) {
  if (level === 'fatal' || level === 'error') return console.error;
  if (level === 'warn') return console.warn;
  return console.log;
}

function sendToSentry(level: Exclude<LogLevel, 'debug'>, message: string, extra?: unknown) {
  if (level === 'info') {
    Sentry.addBreadcrumb({ message, level: 'info', data: extra as Record<string, unknown> });
    return;
  }
  const error = extra instanceof Error ? extra : new Error(message);
  Sentry.captureException(error, {
    level: SENTRY_LEVEL[level],
    extra: extra instanceof Error ? undefined : { detail: extra },
  });
}

function log(level: LogLevel, message: string, extra?: unknown) {
  if (isDev) {
    consoleFn(level)(`[${level.toUpperCase()}]`, message, ...(extra !== undefined ? [extra] : []));
    return;
  }

  if (level === 'debug') {
    // Production: only visible when ?debug=true is in the URL.
    // vConsole lazy-load can be wired here once vconsole is installed.
    if (isDebugMode()) {
      console.log('[DEBUG]', message, ...(extra !== undefined ? [extra] : []));
    }
    return;
  }

  sendToSentry(level, message, extra);
}

export const logger = {
  fatal: (message: string, extra?: unknown) => log('fatal', message, extra),
  error: (message: string, extra?: unknown) => log('error', message, extra),
  warn: (message: string, extra?: unknown) => log('warn', message, extra),
  info: (message: string, extra?: unknown) => log('info', message, extra),
  debug: (message: string, extra?: unknown) => log('debug', message, extra),
};
