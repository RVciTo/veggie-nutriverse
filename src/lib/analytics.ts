/**
 * GA4, gated behind consent (Google Consent Mode v2, default denied).
 *
 * No script that sets a non-exempt cookie loads before the visitor accepts.
 * `initConsentDefault()` runs unconditionally, before anything else, so any
 * pixel that does fire this early is already told to skip storage.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-C6HSL5T24K";

const CONSENT_KEY = "nutriverse-consent";

export type ConsentChoice = "granted" | "denied";

type GtagParams = Record<string, string | number | boolean | undefined>;

function gtag(...args: [string, ...unknown[]]) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(args);
}

/** Sets every Consent Mode v2 signal to denied. Call before any gtag config. */
export function initConsentDefault() {
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });
}

/** Reads the visitor's stored choice, if any. */
export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

/** Stores the choice and updates Consent Mode. Analytics storage only: no ads on this site. */
export function setConsent(choice: ConsentChoice) {
  if (typeof window !== "undefined") window.localStorage.setItem(CONSENT_KEY, choice);
  gtag("consent", "update", { analytics_storage: choice });
}

/** Manually send a page_view (used by the route-change listener). */
export function trackPageView(url: string) {
  gtag("config", GA_ID, { page_path: url });
}

/** Send a custom GA4 event with optional parameters. */
export function trackEvent(name: string, params?: GtagParams) {
  gtag("event", name, params);
}
