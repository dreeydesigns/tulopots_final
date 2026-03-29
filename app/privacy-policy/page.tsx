import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/LegalPageShell';
import { BRAND, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How TuloPots collects, uses, stores, and protects personal data across orders, accounts, Studio briefs, and marketing.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: `Privacy Policy | ${BRAND.name}`,
    description:
      'How TuloPots collects, uses, stores, and protects personal data across orders, accounts, Studio briefs, and marketing.',
    url: `${SITE_URL}/privacy-policy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="This policy explains how TuloPots collects and uses personal data when you browse the site, create an account, place an order, submit a Studio brief, contact us, or choose to receive marketing. We designed the site to keep payment data away from our own servers wherever possible."
      sections={[
        {
          title: 'What we collect',
          body: [
            'We collect information you provide directly, including your name, email address, phone number, delivery details, account credentials, wishlist and cart activity, Studio submissions, review content, and messages sent through contact or newsletter forms.',
            'We also collect limited device and usage information such as page visits, consent selections, product interactions, and campaign attribution parameters when analytics or marketing consent is given.',
          ],
        },
        {
          title: 'Why we use it',
          body: [
            'We use personal data to create and secure accounts, process orders, coordinate delivery, respond to customer requests, review Studio briefs, moderate reviews, detect fraud, improve product placement decisions, and maintain the reliability of the website.',
            'Where applicable, we rely on contract performance, legitimate interests, legal obligations, or your consent. Marketing emails and optional analytics or advertising measurement are used only where you have chosen to allow them.',
          ],
        },
        {
          title: 'Payments, providers, and sharing',
          body: [
            'Card payments are processed by Stripe and M-Pesa transactions are handled through Safaricom-compatible payment flows. TuloPots receives payment status and order references, but does not store full card numbers or security codes on its own systems.',
            'We may share the minimum data necessary with hosting, email, logistics, analytics, and payment service providers that support operations on our behalf. We do not sell customer personal data.',
          ],
        },
        {
          title: 'Security and retention',
          body: [
            'We use hosted payment pages, HttpOnly session cookies, access controls, secure transport, content-security restrictions, and server-side storage to reduce exposure of sensitive data. No online system can guarantee absolute security, especially on compromised devices or browsers, but we aim to minimize what is exposed and who can access it.',
            'We retain account, order, and support records only for as long as needed to operate the business, comply with tax and legal obligations, resolve disputes, and improve our services in aggregated form.',
          ],
        },
        {
          title: 'Your choices and rights',
          body: [
            'You may request access, correction, deletion, or restriction of personal data we hold about you, subject to legal and operational exceptions. You may also withdraw optional marketing consent at any time and manage site tracking choices through the cookie controls.',
            'If you are in Kenya, you may also have rights under the Data Protection Act, 2019, including rights to be informed, to access, to object, and to complain to the Office of the Data Protection Commissioner where appropriate.',
          ],
        },
      ]}
    />
  );
}
