import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { imageByKey } from '@/lib/site';
import type { EditorialLibraryContent } from '@/lib/editorial-library';
import { defaultEditorialLibraryContent } from '@/lib/editorial-library';

const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const imageRefSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
});

const aboutJourneyItemSchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
});

const contactPathwaySchema = z.object({
  href: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  icon: z.enum(['Truck', 'Leaf', 'Sparkles']),
});

const contactInfoSchema = z.object({
  icon: z.enum(['MapPin', 'Phone', 'Mail', 'Clock']),
  title: z.string().min(1),
  text: z.string().min(1),
});

const careGuideCardSchema = z.object({
  icon: z.enum(['Droplets', 'Sun', 'Wind', 'ShieldAlert', 'Leaf', 'Sprout']),
  title: z.string().min(1),
  text: z.string().min(1),
});

const careGuideSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  cards: z.array(careGuideCardSchema),
});

const supportEntrySchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});

const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  linkText: z.string().optional(),
  linkHref: z.string().optional(),
});

const legalSectionSchema = z.object({
  title: z.string().min(1),
  body: z.array(z.string().min(1)),
});

const aboutPageSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
  heroImage: imageRefSchema,
  studioImage: imageRefSchema,
  highlightEyebrow: z.string().min(1),
  highlightTitle: z.string().min(1),
  journeyEyebrow: z.string().min(1),
  journeyTitle: z.string().min(1),
  journey: z.array(aboutJourneyItemSchema),
  valuesEyebrow: z.string().min(1),
  values: z.array(z.string().min(1)),
  valuesBody: z.string().min(1),
  continueEyebrow: z.string().min(1),
  continueTitle: z.string().min(1),
  continuePrimaryCta: ctaSchema,
  continueSecondaryCta: ctaSchema,
});

const contactPageSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
  pathwaysEyebrow: z.string().min(1),
  pathways: z.array(contactPathwaySchema),
  info: z.array(contactInfoSchema),
  formEyebrow: z.string().min(1),
  formTitle: z.string().min(1),
  formIntro: z.string().min(1),
  beforeWriteEyebrow: z.string().min(1),
  beforeWrite: z.array(z.string().min(1)),
  mapEmbedUrl: z.string().min(1),
  responsePromiseEyebrow: z.string().min(1),
  responsePromiseTitle: z.string().min(1),
  responsePromiseBody: z.string().min(1),
});

const careGuidePageSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  tags: z.array(z.string().min(1)),
  sections: z.array(careGuideSectionSchema),
  troubleshootingEyebrow: z.string().min(1),
  troubleshootingTitle: z.string().min(1),
  troubleshooting: z.array(supportEntrySchema),
  explorerSearchEyebrow: z.string().min(1),
  explorerSearchTitle: z.string().min(1),
  explorerUploadEyebrow: z.string().min(1),
  explorerUploadTitle: z.string().min(1),
  explorerUploadBody: z.string().min(1),
  supportEyebrow: z.string().min(1),
  supportTitle: z.string().min(1),
  supportBody: z.string().min(1),
  supportPrimaryCta: ctaSchema,
  supportSecondaryCta: ctaSchema,
});

const faqPageSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  items: z.array(faqItemSchema),
});

const deliveryPageSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  orderNumberPlaceholder: z.string().min(1),
  emailPlaceholder: z.string().min(1),
  trackingPlaceholder: z.string().min(1),
  searchButtonLabel: z.string().min(1),
  searchingButtonLabel: z.string().min(1),
  deliveryWindowLabel: z.string().min(1),
  standardWindowText: z.string().min(1),
  customWindowText: z.string().min(1),
  dispatchLabel: z.string().min(1),
  deliveryLabel: z.string().min(1),
  notificationsLabel: z.string().min(1),
  trackingCodeLabel: z.string().min(1),
  queuedUpdatesLabel: z.string().min(1),
  queuedEmptyText: z.string().min(1),
  timelineLabel: z.string().min(1),
  lookupErrorFallback: z.string().min(1),
});

const legalPageSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  sections: z.array(legalSectionSchema),
});

const campaignPageSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  image: imageRefSchema,
  facts: z.array(z.string().min(1)),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
});

const historyChapterSchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  highlight: z.string().min(1),
  image: imageRefSchema,
  facts: z.array(z.string().min(1)).min(1),
});

const historyGalleryItemSchema = z.object({
  title: z.string().min(1),
  caption: z.string().min(1),
  image: imageRefSchema,
});

const historyPageSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  quote: z.string().min(1),
  leadImage: imageRefSchema,
  chapters: z.array(historyChapterSchema).min(1),
  galleryEyebrow: z.string().min(1),
  galleryTitle: z.string().min(1),
  galleryIntro: z.string().min(1),
  galleryImages: z.array(historyGalleryItemSchema).min(1),
  closingEyebrow: z.string().min(1),
  closingTitle: z.string().min(1),
  closingBody: z.string().min(1),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
});

const editorialArticleSectionSchema = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
});

const editorialArticleSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  eyebrow: z.string().min(1),
  summary: z.string().min(1),
  intro: z.string().min(1),
  visible: z.boolean(),
  heroImage: imageRefSchema,
  keywords: z.array(z.string().min(1)).min(1),
  newsletter: z.object({
    subject: z.string().min(1),
    preheader: z.string().min(1),
  }),
  cta: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
    text: z.string().min(1),
  }),
  sections: z.array(editorialArticleSectionSchema).min(1),
  poemTitle: z.string().min(1),
  poemLines: z.array(z.string().min(1)).min(1),
  relatedLinks: z.array(ctaSchema),
});

const editorialLibraryPageSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  articles: z.array(editorialArticleSchema),
});

export type AboutPageContent = z.infer<typeof aboutPageSchema>;
export type ContactPageContent = z.infer<typeof contactPageSchema>;
export type CareGuidePageContent = z.infer<typeof careGuidePageSchema>;
export type FaqPageContent = z.infer<typeof faqPageSchema>;
export type DeliveryPageContent = z.infer<typeof deliveryPageSchema>;
export type LegalPageContent = z.infer<typeof legalPageSchema>;
export type CampaignPageContent = z.infer<typeof campaignPageSchema>;
export type HistoryPageContent = z.infer<typeof historyPageSchema>;
export type JournalLibraryPageContent = EditorialLibraryContent;
export type ContactInfoIconKey = z.infer<typeof contactInfoSchema>['icon'];
export type CareGuideIconKey = z.infer<typeof careGuideCardSchema>['icon'];

export interface ManagedPagePayloadMap {
  'about.page': AboutPageContent;
  'contact.page': ContactPageContent;
  'care-guide.page': CareGuidePageContent;
  'faq.page': FaqPageContent;
  'delivery.page': DeliveryPageContent;
  'delivery-returns.page': LegalPageContent;
  'terms.page': LegalPageContent;
  'privacy-policy.page': LegalPageContent;
  'cookie-policy.page': LegalPageContent;
  'launch.page': CampaignPageContent;
  'new.page': HistoryPageContent;
  'limited.page': CampaignPageContent;
  'journal.library': JournalLibraryPageContent;
}

export type ManagedPageKey = keyof ManagedPagePayloadMap;

type ManagedPageDefinition<K extends ManagedPageKey> = {
  label: string;
  route: string;
  description: string;
  tips: string[];
  schema: z.ZodType<ManagedPagePayloadMap[K]>;
  payload: ManagedPagePayloadMap[K];
};

export type ManagedPageRecord<K extends ManagedPageKey = ManagedPageKey> = {
  key: K;
  label: string;
  route: string;
  description: string;
  tips: string[];
  payload: ManagedPagePayloadMap[K];
  defaultPayload: ManagedPagePayloadMap[K];
  updatedAt: string | null;
};

const sharedPageTips = [
  'Edit each page one section at a time using normal text fields. Add, remove, and reorder repeated sections as needed.',
  'For images, you can upload a new image, remove the current one, or use an existing site image key like clay, workshop, indoor1, indoor2, outdoor1, or productStudio.',
  'Save when you are ready to publish your changes to the live page.',
];

const managedPageDefinitions: { [K in ManagedPageKey]: ManagedPageDefinition<K> } = {
  'about.page': {
    label: 'About Us',
    route: '/about',
    description: 'Journey-led brand story, values, imagery, and editorial calls to action.',
    tips: sharedPageTips,
    schema: aboutPageSchema,
    payload: {
      eyebrow: 'About TuloPots',
      title: 'From clay to calm living.',
      intro:
        'TuloPots is a Nairobi studio shaping terracotta forms for homes that want warmth, balance, and visual calm. We do not make objects to fill space. We make forms that help a space feel more grounded.',
      primaryCta: { label: 'Explore Clay Forms', href: '/pots' },
      secondaryCta: { label: 'Open Studio', href: '/studio' },
      heroImage: {
        src: 'clay',
        alt: 'Clay work in the TuloPots Nairobi studio',
      },
      studioImage: {
        src: 'workshop',
        alt: 'A handcrafted terracotta workspace at TuloPots',
      },
      highlightEyebrow: 'Crafted for living',
      highlightTitle: 'Material warmth, restrained form, lasting presence.',
      journeyEyebrow: 'The journey',
      journeyTitle: 'A simple path from material to placement.',
      journey: [
        {
          label: '01',
          title: 'From earth',
          body: 'It begins with clay, chosen for warmth, texture, and quiet material honesty.',
        },
        {
          label: '02',
          title: 'Through hand',
          body: 'Each form is shaped slowly, with proportion and presence considered before excess.',
        },
        {
          label: '03',
          title: 'Into spaces',
          body: 'The final object is made to belong in a room, an entry, a shelf, or an open space.',
        },
      ],
      valuesEyebrow: 'What stays true',
      values: [
        'Nairobi crafted',
        'Natural terracotta',
        'Placement first',
        'Editorial restraint',
        'Interior spaces',
        'Open spaces',
      ],
      valuesBody:
        'The point is not decoration for its own sake. The point is to shape forms that carry calm into real rooms, real corners, and real daily life.',
      continueEyebrow: 'Continue',
      continueTitle:
        'Explore the forms, or begin a more guided Studio conversation.',
      continuePrimaryCta: { label: 'View Collection', href: '/pots' },
      continueSecondaryCta: { label: 'Contact Us', href: '/contact' },
    },
  },
  'contact.page': {
    label: 'Contact Us',
    route: '/contact',
    description: 'Support pathways, contact details, contact-form context, and response promise.',
    tips: sharedPageTips,
    schema: contactPageSchema,
    payload: {
      eyebrow: 'Get in Touch',
      title: 'Contact the studio with clarity, not friction.',
      intro:
        'Whether you need delivery help, care guidance, wholesale information, or a Studio conversation, this is the right place to start. We keep replies clear, warm, and useful.',
      primaryCta: { label: 'Open Studio', href: '/studio' },
      secondaryCta: { label: 'Track an Order', href: '/delivery' },
      pathwaysEyebrow: 'Fastest routes',
      pathways: [
        {
          href: '/delivery',
          title: 'Delivery help',
          body: 'Track a paid order, confirm timing, or check what happens after payment.',
          icon: 'Truck',
        },
        {
          href: '/care-guide',
          title: 'Care guidance',
          body: 'Search common issues or upload a plant and terracotta challenge for support.',
          icon: 'Leaf',
        },
        {
          href: '/studio',
          title: 'Studio briefs',
          body: 'Start custom work, quantity requests, or a more guided placement conversation.',
          icon: 'Sparkles',
        },
      ],
      info: [
        { icon: 'MapPin', title: 'Visit Us', text: 'Ngong Road, Nairobi, Kenya' },
        { icon: 'Phone', title: 'Call Us', text: '+254743817931' },
        { icon: 'Mail', title: 'Email Us', text: 'hello@tulopots.com' },
        { icon: 'Clock', title: 'Open Hours', text: 'Mon–Sat, 9AM – 6PM EAT' },
      ],
      formEyebrow: 'Send a message',
      formTitle: 'Tell us what you need.',
      formIntro:
        'Write to us about a form, a care issue, a delivery question, or a larger project. We usually reply within one working day.',
      beforeWriteEyebrow: 'Before you write',
      beforeWrite: [
        'Use Delivery Tracking first if your order is already paid.',
        'Use Care Guide if the issue is about watering, marks, or plant health.',
        'Use Studio when your request involves custom quantities, inspiration, or sourcing.',
      ],
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.199997936854!2d36.7817!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d22ba8cbbf%3A0x66fb2be11a4c6de5!2sNgong%20Road%2C%20Nairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1710000000000!5m2!1sen!2ske',
      responsePromiseEyebrow: 'Response promise',
      responsePromiseTitle: 'Clear replies, practical next steps, and no lost messages.',
      responsePromiseBody:
        'We use your message to route support properly, whether that means delivery follow-up, care guidance, sourcing help, or Studio direction.',
    },
  },
  'care-guide.page': {
    label: 'Care Guide',
    route: '/care-guide',
    description: 'Care sections, troubleshooting blocks, searchable support, and upload-help CTA copy.',
    tips: sharedPageTips,
    schema: careGuidePageSchema,
    payload: {
      eyebrow: 'Plant & Pot Support',
      title: 'Care Guide',
      intro:
        'Guidance for keeping your terracotta forms beautiful and your plant pairings healthy, written the TuloPots way: short, calm, and useful.',
      tags: ['Terracotta care', 'Interior spaces', 'Open spaces', 'Troubleshooting'],
      sections: [
        {
          id: 'terracotta',
          title: 'Terracotta Care',
          intro:
            'Terracotta is naturally porous and breathable. That is what makes it so beautiful for plants, but it also means the clay benefits from small acts of care.',
          cards: [
            {
              icon: 'Droplets',
              title: 'Soak before first use',
              text: 'Before planting, soak your terracotta piece in clean water for a few hours. This helps the clay settle and softens the first-day moisture pull from the soil.',
            },
            {
              icon: 'Wind',
              title: 'Let it breathe',
              text: 'Terracotta performs best when airflow is good. Avoid leaving pieces trapped in sealed decorative sleeves for long periods.',
            },
            {
              icon: 'ShieldAlert',
              title: 'Clean gently',
              text: 'Use a soft cloth, mild soap, and water. Avoid harsh chemical cleaners that can stain or weaken the clay surface over time.',
            },
          ],
        },
        {
          id: 'indoor',
          title: 'For Interior Spaces',
          intro:
            'Our interior pairings are selected for calm, breathable living. Keep light, moisture, and drainage in balance rather than following a rigid daily rhythm.',
          cards: [
            {
              icon: 'Leaf',
              title: 'Peace Lily & Monstera',
              text: 'Keep in bright indirect light. Water when the top layer of soil feels dry rather than on a fixed daily schedule.',
            },
            {
              icon: 'Sprout',
              title: 'Snake Plant & ZZ Plant',
              text: 'These are low-maintenance choices. Let soil dry properly between watering, especially in cooler rooms.',
            },
            {
              icon: 'Sun',
              title: 'Aloe & Succulents',
              text: 'Place near bright windows and avoid overwatering. Terracotta helps here because it releases extra moisture faster.',
            },
          ],
        },
        {
          id: 'outdoor',
          title: 'For Open Spaces',
          intro:
            'Open-space forms face stronger sun, dust, wind, and rain. A little maintenance keeps them looking premium and lasting longer.',
          cards: [
            {
              icon: 'Sun',
              title: 'Strong sunlight is okay',
              text: 'Terracotta handles sun beautifully, but the plant inside may still need a different watering rhythm in hotter weeks.',
            },
            {
              icon: 'Droplets',
              title: 'Check drainage after rain',
              text: 'Make sure drainage holes stay open. Standing water can damage roots even when the clay itself is fine.',
            },
            {
              icon: 'ShieldAlert',
              title: 'Move with care',
              text: 'Larger terracotta forms are heavy. Lift from the base, not the rim, especially after watering.',
            },
          ],
        },
      ],
      troubleshootingEyebrow: 'Troubleshooting',
      troubleshootingTitle: 'Common Questions',
      troubleshooting: [
        {
          title: 'White marks on the pot?',
          text: 'This is usually mineral salt buildup from water and soil. Wipe gently with diluted vinegar and rinse with clean water.',
        },
        {
          title: 'Soil drying too fast?',
          text: 'Terracotta naturally breathes. Try slightly more frequent watering, mulch on top, or softer indirect light.',
        },
        {
          title: 'Leaves turning yellow?',
          text: 'This is often overwatering, poor drainage, or low light. Check the soil and light conditions before watering again.',
        },
        {
          title: 'Outdoor pot looking dusty?',
          text: 'Dust is normal. Clean with a soft damp cloth and let the clay dry naturally. Avoid glossy chemical finishes.',
        },
      ],
      explorerSearchEyebrow: 'Search Support',
      explorerSearchTitle: 'Find a care answer fast',
      explorerUploadEyebrow: 'Upload a challenge',
      explorerUploadTitle: 'Show us what is happening',
      explorerUploadBody:
        'If a leaf is yellowing, the clay is marking, or a placement is not feeling right, upload a photo and describe the issue. We will respond from the support inbox.',
      supportEyebrow: 'Need more help?',
      supportTitle: 'Let TuloPots help you choose well',
      supportBody:
        'Whether you are styling a home, refreshing an open space, or planning a custom brief, we can guide you toward the right form and the right pairing.',
      supportPrimaryCta: { label: 'Contact Us', href: '/contact' },
      supportSecondaryCta: { label: 'Visit FAQ', href: '/faq' },
    },
  },
  'faq.page': {
    label: 'FAQ',
    route: '/faq',
    description: 'FAQ hero copy and every question-answer pair shown in the accordion.',
    tips: sharedPageTips,
    schema: faqPageSchema,
    payload: {
      eyebrow: 'Help Centre',
      title: 'Frequently Asked Questions',
      intro:
        'Everything you need to know about TuloPots, our clay forms, and how they live in interior spaces and open spaces.',
      items: [
        {
          question: 'What is TuloPots?',
          answer:
            'TuloPots is a Nairobi-based terracotta studio creating handcrafted clay forms for interior spaces and open spaces.',
        },
        {
          question: 'Do your products come with plants?',
          answer:
            'Some forms are available as pot-only pieces, while others can be paired with a plant depending on the listing and availability.',
        },
        {
          question: 'How do I care for terracotta?',
          answer:
            'Terracotta benefits from gentle cleaning, good airflow, and balanced watering. It is naturally breathable, so it helps soil release excess moisture.',
          linkText: 'See our Care Guide',
          linkHref: '/care-guide',
        },
        {
          question: 'How long does delivery take?',
          answer:
            'Standard paid orders are planned around a 2-day delivery window after purchase. Custom or studio-led work can take up to 21 days.',
        },
        {
          question: 'Can I request custom quantities or sourcing help?',
          answer:
            'Yes. Use Studio when you need a custom brief, quantity planning, or a more guided placement conversation.',
        },
      ],
    },
  },
  'delivery.page': {
    label: 'Delivery Tracking',
    route: '/delivery',
    description: 'Tracking-page hero, helper labels, and customer-facing delivery language.',
    tips: sharedPageTips,
    schema: deliveryPageSchema,
    payload: {
      eyebrow: 'Delivery Tracking',
      title: 'Track Your Order',
      intro:
        'Standard paid orders are planned around a 2-day delivery window after purchase. Delivery to Nairobi CBD is KES 350, orders above KES 7,000 ship free within Nairobi CBD, and further locations are quoted after routing review. Custom work follows a longer studio rhythm and can take up to 21 days.',
      orderNumberPlaceholder: 'Order number',
      emailPlaceholder: 'Customer email',
      trackingPlaceholder: 'Tracking code (optional)',
      searchButtonLabel: 'Check Order',
      searchingButtonLabel: 'Checking...',
      deliveryWindowLabel: 'Delivery window',
      standardWindowText: 'Standard order · about 2 days',
      customWindowText: 'Custom order · up to 21 days',
      dispatchLabel: 'Estimated dispatch',
      deliveryLabel: 'Estimated delivery',
      notificationsLabel: 'Notifications',
      trackingCodeLabel: 'Tracking code',
      queuedUpdatesLabel: 'Queued updates',
      queuedEmptyText: 'No delivery notifications have been queued yet.',
      timelineLabel: 'Timeline',
      lookupErrorFallback: 'Unable to find that order.',
    },
  },
  'delivery-returns.page': {
    label: 'Delivery & Returns',
    route: '/delivery-returns',
    description: 'Delivery timing, inspection, returns, and refund policy content.',
    tips: sharedPageTips,
    schema: legalPageSchema,
    payload: {
      eyebrow: 'Delivery',
      title: 'Delivery & Returns',
      intro:
        'We want delivery and aftercare to feel as considered as the product itself. This page explains our standard handling for dispatch, delivery, inspection, returns, and custom work.',
      sections: [
        {
          title: 'Delivery windows',
          body: [
            'Paid standard orders are planned around a 2-day delivery window after purchase. Destination, access, order volume, and final confirmation can affect the exact handover time, but this is the operating target we communicate to customers.',
            'Delivery to Nairobi CBD starts at KES 350. Orders above KES 7,000 ship free within Nairobi CBD. Further Nairobi and upcountry locations may carry an additional delivery charge after routing review.',
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
      ],
    },
  },
  'terms.page': {
    label: 'Terms of Use',
    route: '/terms',
    description: 'Website, account, order, and legal-use terms.',
    tips: sharedPageTips,
    schema: legalPageSchema,
    payload: {
      eyebrow: 'Legal',
      title: 'Terms of Use',
      intro:
        'These Terms govern access to the TuloPots website, purchases, Studio requests, and account use. By using the site or placing an order, you agree to these Terms and to our pricing, delivery, and policy notices shown at checkout.',
      sections: [
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
      ],
    },
  },
  'privacy-policy.page': {
    label: 'Privacy Policy',
    route: '/privacy-policy',
    description: 'Customer data collection, storage, provider, and rights language.',
    tips: sharedPageTips,
    schema: legalPageSchema,
    payload: {
      eyebrow: 'Privacy',
      title: 'Privacy Policy',
      intro:
        'This policy explains how TuloPots collects and uses personal data when you browse the site, create an account, place an order, submit a Studio brief, contact us, or choose to receive marketing. We designed the site to keep payment data away from our own servers wherever possible.',
      sections: [
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
      ],
    },
  },
  'cookie-policy.page': {
    label: 'Cookie Policy',
    route: '/cookie-policy',
    description: 'Cookie, local storage, analytics, and marketing measurement policy copy.',
    tips: sharedPageTips,
    schema: legalPageSchema,
    payload: {
      eyebrow: 'Cookies',
      title: 'Cookie Policy',
      intro:
        'TuloPots uses a small set of cookies and local storage keys to keep the website secure, remember your cart and theme choices, and, where you permit it, understand how the storefront performs.',
      sections: [
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
      ],
    },
  },
  'launch.page': {
    label: 'Launch Campaign',
    route: '/launch',
    description: 'Campaign hero copy, fact chips, image, and calls to action for the launch page.',
    tips: sharedPageTips,
    schema: campaignPageSchema,
    payload: {
      eyebrow: 'Campaign Landing',
      title: 'Launch-ready space for a new collection.',
      intro:
        'This route is ready for collection launches, studio drops, or editorial campaigns that need a focused story and a clear path into the storefront.',
      image: {
        src: 'hero',
        alt: 'Editorial TuloPots launch campaign hero',
      },
      facts: ['Editorial Focus', 'Collection Story', 'Ready for Launch'],
      primaryCta: { label: 'Open Clay Forms', href: '/pots' },
      secondaryCta: { label: 'Plan Campaign', href: '/contact' },
    },
  },
  'new.page': {
    label: 'History Page',
    route: '/new',
    description:
      'Long-form brand story, chapter imagery, gallery, and calls to action for the TuloPots history page.',
    tips: [
      'Use this page to tell the story of TuloPots in a calm, emotional way. Keep each chapter easy to read and grounded in the brand language.',
      'Each chapter has its own image, body text, highlight line, and fact chips. You can reorder chapters to change the flow of the page.',
      'The gallery can hold workshop images, placed forms, or brand illustrations that deepen the story before the collection call to action.',
    ],
    schema: historyPageSchema,
    payload: {
      eyebrow: 'Our History',
      title: 'Before the brand, there was a feeling Kenyan homes already knew.',
      intro:
        'TuloPots began by naming something quiet. In many homes, there is always one presence that settles a room without asking for attention. We call that feeling Tulo.',
      quote: 'We do not sell pots. We place Tulo.',
      leadImage: {
        src: 'workshop',
        alt: 'Shelves of handcrafted terracotta forms in the TuloPots workshop',
      },
      chapters: [
        {
          label: 'The Feeling',
          title: 'Tulo was felt long before it was named.',
          body:
            'In many Kenyan homes, the thing that completes a space is rarely the loudest object. It is the quiet form by the window, the clay that warms a corner, the presence that makes a room feel held. When it is missing, the room feels almost finished, but not complete.',
          highlight:
            'This is the origin of Tulo: a grounded, quiet presence that turns space into home.',
          image: {
            src: 'historyPresence',
            alt: 'Illustrated terracotta form near a window with warm morning light',
          },
          facts: ['Quiet presence', 'Grounded rooms', 'Kenyan homes'],
        },
        {
          label: 'The City',
          title: 'Nairobi taught us what modern spaces still need.',
          body:
            'We are based in Nairobi, where design-conscious homes, studios, and workplaces ask for more than decoration. They ask for warmth without noise. TuloPots was shaped for rooms that want balance, texture, and emotional calm.',
          highlight:
            'The city gave us the audience first: people who edit carefully, choose intentionally, and want spaces that feel considered.',
          image: {
            src: 'historyNairobi',
            alt: 'Illustrated Nairobi-inspired interior shaped by terracotta forms',
          },
          facts: ['Nairobi rooted', 'Interior spaces', 'Open spaces'],
        },
        {
          label: 'The Hand',
          title: 'Clay became the language because it remembers the hand.',
          body:
            'We chose terracotta because it stays human. It carries weight, warmth, and slight variation without apology. Every curve, edge, and surface keeps the material honest. That is why our forms feel lived with instead of mass-made.',
          highlight:
            'Craft above convenience. Warmth over perfection. Restraint over noise.',
          image: {
            src: 'historyWheel',
            alt: 'Illustrated clay form turning on a potter wheel',
          },
          facts: ['Handcrafted clay', 'Natural warmth', 'Quiet confidence'],
        },
        {
          label: 'Today',
          title: 'What we place now is not decoration. It is completion.',
          body:
            'TuloPots exists to help a room feel settled. Some people come for a clay form. Others come for a plant pairing. Designers come for spaces that need presence, not clutter. The purpose stays the same: to place Tulo where a room needs it most.',
          highlight:
            'From Nairobi outward, the ambition stays clear: African craft, elevated properly, and trusted wherever thoughtful spaces are made.',
          image: {
            src: 'historyHome',
            alt: 'Illustrated room completed with terracotta forms and greenery',
          },
          facts: ['For homes', 'For designers', 'For daily living'],
        },
      ],
      galleryEyebrow: 'Story In Form',
      galleryTitle: 'The story is told in earth, light, and rooms that finally settle.',
      galleryIntro:
        'These images hold the workshop, the material, and the quiet life each form enters once it leaves the shelf.',
      galleryImages: [
        {
          title: 'The workshop',
          caption: 'Clay forms on shelves, waiting for the room they will complete.',
          image: {
            src: 'workshop',
            alt: 'Shelves of handcrafted terracotta in the TuloPots workshop',
          },
        },
        {
          title: 'The placed form',
          caption:
            'Presence begins when the vessel and the room start speaking the same language.',
          image: {
            src: 'indoor1',
            alt: 'Terracotta form placed in an interior with a peace lily',
          },
        },
        {
          title: 'The everyday room',
          caption:
            'Tulo belongs in living spaces that want warmth without excess.',
          image: {
            src: 'indoor4',
            alt: 'Terracotta jug form with trailing pothos in soft light',
          },
        },
      ],
      closingEyebrow: 'Continue',
      closingTitle: 'If a room still feels unfinished, start with what it is missing.',
      closingBody:
        'The collection is where this story becomes part of daily life. Explore the forms, find what fits the space, and let the room settle.',
      primaryCta: { label: 'Explore the Collection', href: '/pots' },
      secondaryCta: { label: 'Open Studio', href: '/studio' },
    },
  },
  'limited.page': {
    label: 'Limited Edition',
    route: '/limited',
    description: 'Limited-drop campaign copy, image, chips, and calls to action.',
    tips: sharedPageTips,
    schema: campaignPageSchema,
    payload: {
      eyebrow: 'Limited Edition',
      title: 'Reserved for short runs and rare forms.',
      intro:
        'This route is ready for exclusive edits, studio-first releases, or smaller drops where scarcity needs to feel intentional rather than loud.',
      image: {
        src: 'productStudio',
        alt: 'Limited edition TuloPots terracotta forms',
      },
      facts: ['Short Run', 'Editorial Drop', 'Quiet Scarcity'],
      primaryCta: { label: 'View Clay Forms', href: '/pots' },
      secondaryCta: { label: 'Open Studio', href: '/studio' },
    },
  },
  'journal.library': {
    label: 'Journal Library',
    route: '/journal',
    description:
      'Journal heading, article summaries, article bodies, newsletter subjects, poems, and related links.',
    tips: [
      'Each article can be edited section by section. You can add new articles, remove old ones, or change their order in the journal.',
      'Keep titles clear and strong. The newsletter subject and preheader are what the email workspace will use.',
      'Use the image field to upload a new article image or replace an existing one, then save to publish the change everywhere.',
    ],
    schema: editorialLibraryPageSchema,
    payload: defaultEditorialLibraryContent,
  },
};

function isManagedPageKey(value: string): value is ManagedPageKey {
  return value in managedPageDefinitions;
}

function parseManagedPagePayload<K extends ManagedPageKey>(
  key: K,
  payload: unknown
): ManagedPagePayloadMap[K] {
  const parsed = managedPageDefinitions[key].schema.safeParse(payload);
  return parsed.success ? parsed.data : managedPageDefinitions[key].payload;
}

export function resolveCmsImage(src: string) {
  const normalized = src.trim();
  if (!normalized) {
    return imageByKey.clay;
  }

  return imageByKey[normalized as keyof typeof imageByKey] || normalized;
}

export function getDefaultManagedPageContent<K extends ManagedPageKey>(
  key: K
): ManagedPagePayloadMap[K] {
  return managedPageDefinitions[key].payload;
}

export async function syncManagedPageContentToDatabase() {
  await prisma.$transaction(
    (
      Object.entries(managedPageDefinitions) as Array<
        [ManagedPageKey, ManagedPageDefinition<ManagedPageKey>]
      >
    ).map(([key, definition]) =>
      prisma.pageContent.upsert({
        where: { key },
        create: {
          key,
          label: definition.label,
          route: definition.route,
          description: definition.description,
          payload: definition.payload,
        },
        update: {
          label: definition.label,
          route: definition.route,
          description: definition.description,
        },
      })
    )
  );
}

export async function listManagedPages(): Promise<ManagedPageRecord[]> {
  await syncManagedPageContentToDatabase();

  const records = await prisma.pageContent.findMany({
    where: {
      key: {
        in: Object.keys(managedPageDefinitions),
      },
    },
  });

  const byKey = new Map(records.map((record) => [record.key, record]));

  return (
    Object.entries(managedPageDefinitions) as Array<
      [ManagedPageKey, ManagedPageDefinition<ManagedPageKey>]
    >
  ).map(([key, definition]) => {
    const record = byKey.get(key);

    return {
      key,
      label: definition.label,
      route: definition.route,
      description: definition.description,
      tips: definition.tips,
      payload: record ? parseManagedPagePayload(key, record.payload) : definition.payload,
      defaultPayload: definition.payload,
      updatedAt: record?.updatedAt.toISOString() || null,
    };
  });
}

export async function getManagedPageContent<K extends ManagedPageKey>(
  key: K
): Promise<ManagedPagePayloadMap[K]> {
  const record = await prisma.pageContent.findUnique({
    where: { key },
  });

  if (!record) {
    await prisma.pageContent.create({
      data: {
        key,
        label: managedPageDefinitions[key].label,
        route: managedPageDefinitions[key].route,
        description: managedPageDefinitions[key].description,
        payload: managedPageDefinitions[key].payload,
      },
    });

    return managedPageDefinitions[key].payload;
  }

  return parseManagedPagePayload(key, record.payload);
}

export async function saveManagedPageContent(
  key: string,
  payload: unknown
): Promise<ManagedPageRecord> {
  if (!isManagedPageKey(key)) {
    throw new Error('Unknown managed page.');
  }

  const definition = managedPageDefinitions[key];
  const parsed = definition.schema.parse(payload);

  const record = await prisma.pageContent.upsert({
    where: { key },
    create: {
      key,
      label: definition.label,
      route: definition.route,
      description: definition.description,
      payload: parsed,
    },
    update: {
      label: definition.label,
      route: definition.route,
      description: definition.description,
      payload: parsed,
    },
  });

  return {
    key,
    label: definition.label,
    route: definition.route,
    description: definition.description,
    tips: definition.tips,
    payload: parseManagedPagePayload(key, record.payload),
    defaultPayload: definition.payload,
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function asManagedPageKey(value: string) {
  if (!isManagedPageKey(value)) {
    throw new Error('Unknown managed page.');
  }

  return value;
}
