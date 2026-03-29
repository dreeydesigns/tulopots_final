'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  CONSENT_EVENT,
  captureAttributionFromLocation,
  readStoredConsent,
  trackEvent,
  type ConsentLevel,
} from '@/lib/tracking';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '';

function getConsentSettings(level: ConsentLevel) {
  return {
    analytics_storage:
      level === 'analytics' || level === 'marketing' ? 'granted' : 'denied',
    ad_storage: level === 'marketing' ? 'granted' : 'denied',
    ad_user_data: level === 'marketing' ? 'granted' : 'denied',
    ad_personalization: level === 'marketing' ? 'granted' : 'denied',
  };
}

export function TrackingProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<ConsentLevel>('essential');

  const search = useMemo(() => searchParams?.toString() || '', [searchParams]);
  const activeTagId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;

  useEffect(() => {
    setConsent(readStoredConsent());

    const handleConsentChange = (event: Event) => {
      const custom = event as CustomEvent<ConsentLevel>;
      setConsent(custom.detail || readStoredConsent());
    };

    window.addEventListener(CONSENT_EVENT, handleConsentChange);
    return () => {
      window.removeEventListener(CONSENT_EVENT, handleConsentChange);
    };
  }, []);

  useEffect(() => {
    captureAttributionFromLocation(search ? `?${search}` : '');
  }, [search]);

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', getConsentSettings(consent));
    }
  }, [consent]);

  useEffect(() => {
    const path = search ? `${pathname}?${search}` : pathname;

    void trackEvent(
      'page_view',
      {
        path,
        viewportWidth:
          typeof window !== 'undefined' ? window.innerWidth : undefined,
      },
      'analytics'
    );
  }, [pathname, search]);

  return activeTagId ? (
    <>
      <Script
        id="tp-gtag-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${activeTagId}`}
        strategy="afterInteractive"
      />
      <Script
        id="tp-gtag-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('consent', 'default', ${JSON.stringify(getConsentSettings(consent))});
            ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true, send_page_view: false });` : ''}
            ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
          `,
        }}
      />
    </>
  ) : null;
}
