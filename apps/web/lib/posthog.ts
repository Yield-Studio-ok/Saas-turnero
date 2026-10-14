import posthog from "posthog-js";

export const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY || "phc_turneropro_demo_analytics_key";
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let isPostHogInitialized = false;

export function initPostHog() {
  if (typeof window !== "undefined" && !isPostHogInitialized) {
    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: "identified_only",
        capture_pageview: false, // Pageviews are tracked manually in PostHogPageView for Next.js App Router
        capture_pageleave: true,
        autocapture: true,
      });
      isPostHogInitialized = true;
    } catch (err) {
      console.warn("[PostHog] Initialization warning:", err);
    }
  }
  return posthog;
}

export function captureEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    try {
      if (!isPostHogInitialized) {
        initPostHog();
      }
      posthog.capture(eventName, properties);
    } catch (err) {
      console.warn("[PostHog] Error capturing event:", err);
    }
  }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    try {
      if (!isPostHogInitialized) {
        initPostHog();
      }
      posthog.identify(userId, traits);
    } catch (err) {
      console.warn("[PostHog] Error identifying user:", err);
    }
  }
}

export function resetUser() {
  if (typeof window !== "undefined" && isPostHogInitialized) {
    try {
      posthog.reset();
    } catch (err) {
      console.warn("[PostHog] Error resetting user:", err);
    }
  }
}

export default posthog;
