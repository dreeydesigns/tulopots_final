import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/LegalPageShell';
import { BRAND, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Terms governing purchases, account use, Studio requests, and content on TuloPots.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: `Terms of Use | ${BRAND.name}`,
    description:
      'Terms governing purchases, account use, Studio requests, and content on TuloPots.',
    url: `${SITE_URL}/terms`,
  },
};

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Terms of Use"
      intro="These Terms govern access to the TuloPots website, purchases, Studio requests, and account use. By using the site or placing an order, you agree to these Terms and to our pricing, delivery, and policy notices shown at checkout."
      sections={[
        {
          title: 'Accounts and access',
          body: [
            'You are responsible for keeping your login credentials private and for activity that happens through your account. TuloPots may suspend, restrict, or close accounts used for fraud, abuse, scraping, chargeback abuse, impersonation, or interference with the website, staff, or other customers.',
            'You must provide accurate account, delivery, and payment information. We may refuse service, delay fulfilment, or cancel access where information is incomplete, misleading, or unsafe to act on.',
          ],
        },
        {
          title: 'Orders and payment',
          body: [
            'Orders are accepted only after successful payment confirmation or an approved manual arrangement from TuloPots. Product availability, pricing, and delivery timing may change before acceptance if an item becomes unavailable, a listing error is discovered, or shipping details cannot be verified.',
            'Card payments are processed through Stripe-hosted checkout and M-Pesa payments are initiated through Safaricom-compatible flows. TuloPots does not store raw card numbers on its own servers.',
          ],
        },
        {
          title: 'Craft variation and custom work',
          body: [
            'Because TuloPots products are handcrafted from natural clay, minor variation in tone, texture, dimensions, glaze character, and plant pairing is part of the product, not a defect. Product photography, styling, and reference images are illustrative and may vary slightly from the delivered piece.',
            'Studio briefs, custom commissions, made-to-order work, and bulk or event orders may require additional production time, staged approvals, and non-refundable deposits. Once production has started, cancellations and refunds may be limited or unavailable except where required by law.',
          ],
        },
        {
          title: 'Delivery, inspection, and claims',
          body: [
            'Delivery windows are estimates and may be affected by weather, traffic, carrier issues, supplier delays, or customer unavailability. Risk in products passes on delivery to the address or recipient provided by the customer.',
            'You should inspect deliveries promptly and report visible transit damage, missing items, or material fulfilment errors as soon as possible with photos where available. TuloPots may request reasonable evidence before replacing, refunding, or crediting an order.',
          ],
        },
        {
          title: 'Use of the website',
          body: [
            'You may not copy, mirror, resell, reverse engineer, frame, scrape, or exploit TuloPots content, product information, code, pricing, or imagery without written permission. Automated abuse, credential attacks, malicious scripts, phishing, and attempts to interfere with checkout or admin systems are prohibited.',
            'We may investigate suspicious activity, preserve relevant logs, block requests, and cooperate with payment providers, hosting providers, and law enforcement where necessary to protect the business and our customers.',
          ],
        },
        {
          title: 'Liability and governing law',
          body: [
            'To the maximum extent permitted by law, TuloPots is not liable for indirect, incidental, special, consequential, punitive, or business-interruption losses arising from use of the site, delayed delivery, plant care outcomes, or third-party service outages. Our total liability for a claim relating to an order will not exceed the amount paid for that order, except where non-excludable law requires otherwise.',
            'These Terms are governed by the laws of Kenya. Any dispute should first be raised directly with TuloPots in good faith so that we can attempt resolution before formal proceedings.',
          ],
        },
      ]}
    />
  );
}
