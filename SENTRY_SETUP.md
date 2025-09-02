# Sentry Integration

This project is configured for error tracking and performance monitoring with Sentry.

## Setup Steps

### 1. Create Sentry Account

1. Go to [Sentry.io](https://sentry.io)
2. Create a free account
3. Create a new project (select React + TypeScript)
4. Copy the DSN (Data Source Name) information

### 2. Configure Environment Variables

Create your `.env` file and add the following variables:

```env
# Sentry Configuration
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_APP_VERSION=1.0.0
```

### 3. Update Sentry DSN

Update the DSN in `src/services/sentry.ts` file:

```typescript
dsn: import.meta.env.VITE_SENTRY_DSN || "YOUR_SENTRY_DSN_HERE",
```

## Features

### Error Tracking

- Automatically captures JavaScript errors
- Catches UI errors with React Error Boundary
- Monitors network errors
- Automatically filters sensitive information

### Performance Monitoring

- Measures page load times
- Monitors API call performance
- Tracks React Router navigations

### Session Replay

- Records user interactions
- Provides full session replay on errors

## Testing

To test Sentry in development environment:

```typescript
import { runAllSentryTests } from "./services/sentry-utils";

// Run in console
runAllSentryTests();
```

## Configuration

### Sample Rate Settings

- `tracesSampleRate`: 20% (performance monitoring)
- `replaysSessionSampleRate`: 10% (session replay)
- `replaysOnErrorSampleRate`: 100% (replay on error)

### Environment Settings

- Automatically active in production
- Debug mode enabled in development
- Sensitive information automatically filtered

## Security

Sentry configuration includes the following security measures:

- Authorization headers automatically deleted
- Cookie information filtered
- Token and api_key parameters cleaned from URLs
- Sensitive user information protected

## Dashboard

In Sentry dashboard you can see:

- Error reports and stack traces
- Performance metrics
- User interactions
- Session replays
- Environment-based filtering

## Troubleshooting

### Sentry Not Working

1. Check if DSN is correct
2. Check if environment variables are loaded
3. Check network connection
4. Check error messages in browser console

### Sensitive Information Visible

1. Check if `beforeSend` hook is working
2. Update filtering rules
3. Check data scrubbing settings in Sentry dashboard
