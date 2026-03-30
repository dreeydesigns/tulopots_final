import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/LegalPageShell';
import { BRAND, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Delivery & Returns',
  description:
    'Delivery timing, inspection, returns, replacements, and custom-order rules for TuloPots.',
  alternates: {
    canonical: '/delivery-returns',
  },
  openGraph: {
    title: `Delivery & Returns | ${BRAND.name}`,
    description:
      'Delivery timing, inspection, returns, replacements, and custom-order rules for TuloPots.',
    url: `${SITE_URL}/delivery-returns`,
  },
};

export default function DeliveryReturnsPage() {
  return (
    <LegalPageShell
      eyebrow="Delivery"
      title="Delivery & Returns"
      intro="We want delivery and aftercare to feel as considered as the product itself. This page explains our standard handling for dispatch, delivery, inspection, returns, and custom work."
      sections={[
        {
          title: 'Delivery windows',
          body: [
            'Paid standard orders are planned around a 2-day delivery window after purchase. Destination, access, order volume, and final confirmation can affect the exact handover time, but this is the operating target we communicate to customers.',
            'Custom commissions, Studio briefs, and other made-to-order work follow a longer studio rhythm. Unless another timeline is agreed in writing, custom work should be understood as taking up to 21 days before delivery.',
            'If we cannot reach the recipient, verify access, or complete delivery safely, the order may be rescheduled and additional charges may apply where repeat delivery is required.',
          ],
        },
        {
          title: 'Inspection on arrival',
          body: [
            'Please inspect your order promptly after delivery. If a piece arrives damaged in transit, materially incorrect, or incomplete, contact TuloPots as soon as possible with photos of the item, packaging, and delivery label where available.',
            'Because plants are living materials, appearance can change with travel, weather, handling, and placement after delivery. Normal plant variation does not by itself qualify as a defect.',
          ],
        },
        {
          title: 'Returns and replacements',
          body: [
            'Unused standard items may be considered for return or exchange where they are in original condition and a return is requested promptly. Delivery fees, urgent handling fees, and non-standard planting or styling costs may be non-refundable.',
            'Custom commissions, Studio-driven builds, made-to-order forms, and personalized event or bulk work are generally final once production has started, except where a mandatory legal right applies.',
          ],
        },
        {
          title: 'Refund handling',
          body: [
            'Where TuloPots approves a refund, it will usually be returned through the original payment method unless another route is agreed in writing. Processing times can vary depending on banks, payment providers, and mobile money operators.',
            'Chargebacks filed without first raising the issue with TuloPots may be treated as misuse where order records show valid fulfilment or successful delivery.',
          ],
        },
      ]}
    />
  );
}
