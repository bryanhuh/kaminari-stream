import posthog from "posthog-js";

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    autocapture: false,
    capture_pageview: false,
  });
}

export function trackPageView() {
  if (!import.meta.env.VITE_POSTHOG_KEY) return;
  posthog.capture("$pageview");
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!import.meta.env.VITE_POSTHOG_KEY) return;
  posthog.capture(event, properties);
}
