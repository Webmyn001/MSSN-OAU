import { handleErrorWithSentry, replayIntegration, feedbackIntegration } from "@sentry/sveltekit";
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: 'https://8a6c37d91d61d59f93315969a077bace@o4508522730946560.ingest.us.sentry.io/4508522732519424',

  beforeSend(event, hint) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception && event.event_id) {
      Sentry.showReportDialog({
        eventId: event.event_id,
        title: "Assalamu aleikum!",
        subtitle: "It looks like we're having issues (probably a bug).",
        subtitle2: "Our dev team has been notified. Could you perhaps provide us more info on what happened?",
        successMessage: "We've received your feedback. JazakumuLlahu Khayran!"
      });
    }
    return event;
  },

  tracesSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // If you don't want to use Session Replay, just remove the line below:
  integrations: [replayIntegration(
      {
        blockAllMedia: true
      }
  ),
    feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: "light",
    })
  ],
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
