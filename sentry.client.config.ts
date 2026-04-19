import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',
  // Capture 100% of transactions for internal dev stage
  tracesSampleRate: 1.0,
  // Strip sensitive auth tokens before sending
  beforeSend(event) {
    if (event.request?.cookies) {
      event.request.cookies = {};
    }
    return event;
  },
});
