export type ConsentLevel = 'essential' | 'analytics' | 'marketing';

export const COOKIE_CONSENT_KEY = 'tp_cookie_consent';
export const ATTRIBUTION_KEY = 'tp_attribution';
export const TRACKING_SESSION_KEY = 'tp_tracking_session';
export const CONSENT_EVENT = 'tp:consent-change';

type TrackingPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function consentRank(level: ConsentLevel) {
  if (level === 'marketing') return 2;
  if (level === 'analytics') return 1;
  return 0;
}

export function readStoredConsent(): ConsentLevel {
  if (!isBrowser()) {
    return 'essential';
  }

  const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (stored === 'analytics' || stored === 'marketing') {
    return stored;
  }

  return 'essential';
}

export function writeStoredConsent(level: ConsentLevel) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(COOKIE_CONSENT_KEY, level);
  document.cookie = `${COOKIE_CONSENT_KEY}=${level}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: level }));
}

export function getTrackingSessionKey() {
  if (!isBrowser()) {
    return '';
  }

  const existing = window.localStorage.getItem(TRACKING_SESSION_KEY);
  if (existing) {
    return existing;
  }

  const created =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(TRACKING_SESSION_KEY, created);
  return created;
}

export function captureAttributionFromLocation(search: string) {
  if (!isBrowser()) {
    return;
  }

  const params = new URLSearchParams(search);
  const source = params.get('utm_source');
  const medium = params.get('utm_medium');
  const campaign = params.get('utm_campaign');
  const term = params.get('utm_term');
  const content = params.get('utm_content');
  const gclid = params.get('gclid');
  const fbclid = params.get('fbclid');

  if (
    !source &&
    !medium &&
    !campaign &&
    !term &&
    !content &&
    !gclid &&
    !fbclid
  ) {
    return;
  }

  const payload = {
    source,
    medium,
    campaign,
    term,
    content,
    gclid,
    fbclid,
    landingPath: `${window.location.pathname}${window.location.search}`,
    capturedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(payload));
}

export function readAttribution() {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Record<string, string | null>;
  } catch {
    return null;
  }
}

function getReferrerSource() {
  if (!isBrowser() || !document.referrer) {
    return 'direct';
  }

  try {
    return new URL(document.referrer).hostname;
  } catch {
    return 'direct';
  }
}

export async function trackEvent(
  eventName: string,
  payload: TrackingPayload = {},
  minimumConsent: ConsentLevel = 'analytics'
) {
  if (!isBrowser()) {
    return;
  }

  const consentLevel = readStoredConsent();
  if (consentRank(consentLevel) < consentRank(minimumConsent)) {
    return;
  }

  const attribution = readAttribution();
  const body = {
    eventName,
    path: `${window.location.pathname}${window.location.search}`,
    source: attribution?.source || getReferrerSource(),
    consentLevel,
    sessionKey: getTrackingSessionKey(),
    payload: {
      ...payload,
      utmCampaign: attribution?.campaign || null,
      utmMedium: attribution?.medium || null,
      gclid: attribution?.gclid || null,
      fbclid: attribution?.fbclid || null,
    },
  };

  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // Ignore analytics transport errors.
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  }
}
