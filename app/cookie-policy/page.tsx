import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/LegalPageShell';
import { BRAND, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How TuloPots uses cookies and local storage for sessions, cart continuity, analytics, and future advertising measurement.',
  alternates: {
    canonical: '/cookie-policy',
  },
  openGraph: {
    title: `Cookie Policy | ${BRAND.name}`,
    description:
      'How TuloPots uses cookies and local storage for sessions, cart continuity, analytics, and future advertising measurement.',
    url: `${SITE_URL}/cookie-policy`,
  },
};

export default function CookiePolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Cookies"
      title="Cookie Policy"
      intro="TuloPots uses a small set of cookies and local storage keys to keep the website secure, remember your cart and theme choices, and, where you permit it, understand how the storefront performs."
      sections={[
        {
          title: 'Essential storage',
          body: [
            'Essential cookies and local storage keep sign-in sessions active, preserve cart and wishlist state, support consent choices, and protect core flows such as checkout, Studio, and account access.',
            'These items are required for the site to work properly and cannot be fully disabled without affecting functionality.',
          ],
        },
        {
          title: 'Analytics',
          body: [
            'If you allow analytics, TuloPots records first-party product and page interactions so we can understand what visitors browse, where journeys break, and which forms or pages need improvement. This helps us refine content, flow, and merchandising decisions.',
            'Analytics records are designed to avoid raw payment details and other high-risk personal fields.',
          ],
        },
        {
          title: 'Marketing measurement',
          body: [
            'If you allow marketing, TuloPots can activate ad and campaign measurement tags for future platforms such as Google Ads so visits and purchases can be attributed back to campaigns. This setting is optional and can be changed later through the banner when it reappears or by clearing your browser storage.',
            'Allowing marketing measurement does not authorize TuloPots to sell your personal data.',
          ],
        },
        {
          title: 'Managing preferences',
          body: [
            'You can change browser storage settings by clearing site data in your browser. Doing so may sign you out, empty your cart, and remove your saved preferences until you interact with the site again.',
            'If a browser extension or device-level tool blocks storage or scripts, some site features may not work as intended.',
          ],
        },
      ]}
    />
  );
}
