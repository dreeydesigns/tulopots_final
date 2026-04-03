import type { Product } from '@/lib/products';
import {
  getDefaultManagedPageContent,
  getManagedPageContent,
  type ManagedPageKey,
} from '@/lib/cms';

export type KnowledgeCategory =
  | 'products'
  | 'delivery'
  | 'care'
  | 'account'
  | 'studio'
  | 'policies'
  | 'contact';

export type KnowledgeEntry = {
  id: string;
  category: KnowledgeCategory;
  kind: 'product' | 'answer';
  title: string;
  summary: string;
  href: string;
  label: string;
  keywords: string[];
  image?: string;
};

async function readManagedPage<K extends ManagedPageKey>(key: K) {
  try {
    return await getManagedPageContent(key);
  } catch {
    return getDefaultManagedPageContent(key);
  }
}

function uniqueKeywords(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => String(value || '').split(/[\s,/.()+-]+/))
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 1)
    )
  );
}

function trimText(value: string, limit = 180) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length <= limit ? normalized : `${normalized.slice(0, limit - 1).trim()}…`;
}

function categoryLabel(category: KnowledgeCategory) {
  switch (category) {
    case 'products':
      return 'Product';
    case 'delivery':
      return 'Delivery';
    case 'care':
      return 'Care';
    case 'account':
      return 'Account';
    case 'studio':
      return 'Studio';
    case 'policies':
      return 'Policy';
    case 'contact':
      return 'Contact';
    default:
      return 'Guide';
  }
}

export async function getKnowledgeBaseEntries(products: Product[]): Promise<KnowledgeEntry[]> {
  const [
    aboutPage,
    contactPage,
    careGuidePage,
    faqPage,
    deliveryPage,
    deliveryReturnsPage,
    termsPage,
    privacyPage,
    cookiePage,
  ] = await Promise.all([
    readManagedPage('about.page'),
    readManagedPage('contact.page'),
    readManagedPage('care-guide.page'),
    readManagedPage('faq.page'),
    readManagedPage('delivery.page'),
    readManagedPage('delivery-returns.page'),
    readManagedPage('terms.page'),
    readManagedPage('privacy-policy.page'),
    readManagedPage('cookie-policy.page'),
  ]);

  const productEntries: KnowledgeEntry[] = products.map((product) => ({
    id: `product:${product.slug}`,
    category: 'products',
    kind: 'product',
    title: product.name,
    summary: trimText(product.short || product.description),
    href: `/product/${product.slug}`,
    label: categoryLabel('products'),
    image: product.image,
    keywords: uniqueKeywords([
      product.name,
      product.short,
      product.description,
      product.sku,
      product.category,
      product.size,
      product.details?.shape,
      product.details?.material,
      product.details?.finish,
      product.plantGuide ? Object.values(product.plantGuide).join(' ') : '',
    ]),
  }));

  const faqEntries: KnowledgeEntry[] = faqPage.items.map((item, index) => ({
    id: `faq:${index}`,
    category: 'account',
    kind: 'answer',
    title: item.question,
    summary: trimText(item.answer),
    href: item.linkHref || '/faq',
    label: categoryLabel('account'),
    keywords: uniqueKeywords([item.question, item.answer, item.linkText, item.linkHref]),
  }));

  const careEntries: KnowledgeEntry[] = careGuidePage.sections.flatMap((section) =>
    section.cards.map((card, index) => ({
      id: `care:${section.id}:${index}`,
      category: 'care' as const,
      kind: 'answer' as const,
      title: `${section.title}: ${card.title}`,
      summary: trimText(card.text),
      href: '/care-guide',
      label: categoryLabel('care'),
      keywords: uniqueKeywords([section.title, section.intro, card.title, card.text]),
    }))
  );

  const troubleshootingEntries: KnowledgeEntry[] = careGuidePage.troubleshooting.map(
    (entry, index) => ({
      id: `care:troubleshooting:${index}`,
      category: 'care',
      kind: 'answer',
      title: entry.title,
      summary: trimText(entry.text),
      href: '/care-guide',
      label: categoryLabel('care'),
      keywords: uniqueKeywords([entry.title, entry.text, 'plant issue', 'leaf problem']),
    })
  );

  const deliveryEntries: KnowledgeEntry[] = [
    {
      id: 'delivery:tracking',
      category: 'delivery',
      kind: 'answer',
      title: 'How order tracking works',
      summary: trimText(deliveryPage.intro),
      href: '/delivery',
      label: categoryLabel('delivery'),
      keywords: uniqueKeywords([
        deliveryPage.title,
        deliveryPage.intro,
        deliveryPage.standardWindowText,
        deliveryPage.customWindowText,
        'tracking',
        'order status',
      ]),
    },
    {
      id: 'delivery:timing',
      category: 'delivery',
      kind: 'answer',
      title: 'Delivery timing',
      summary:
        'Standard paid orders are planned around 2 days after purchase. Custom work follows a 21-day studio timeline unless another schedule is agreed.',
      href: '/delivery-returns',
      label: categoryLabel('delivery'),
      keywords: uniqueKeywords([
        '2 days delivery',
        '21 days custom order',
        deliveryPage.standardWindowText,
        deliveryPage.customWindowText,
      ]),
    },
  ];

  const accountEntries: KnowledgeEntry[] = [
    {
      id: 'account:signin',
      category: 'account',
      kind: 'answer',
      title: 'Sign in, sign up, and account settings',
      summary:
        'Create an account with your name, email, phone, country, language, and preferred currency. Once signed in, Settings lets you update profile details, notifications, and saved delivery defaults.',
      href: '/settings',
      label: categoryLabel('account'),
      keywords: uniqueKeywords([
        'sign in',
        'signup',
        'login',
        'create account',
        'settings',
        'profile',
        'currency',
        'language',
      ]),
    },
    {
      id: 'account:checkout',
      category: 'account',
      kind: 'answer',
      title: 'Checkout and payment support',
      summary:
        'Signed-in customers can check out with M-Pesa or card, save delivery defaults, and receive updates through the channels they choose.',
      href: '/cart',
      label: categoryLabel('account'),
      keywords: uniqueKeywords([
        'checkout',
        'mpesa',
        'card',
        'payment',
        'saved address',
      ]),
    },
  ];

  const studioEntries: KnowledgeEntry[] = [
    {
      id: 'studio:overview',
      category: 'studio',
      kind: 'answer',
      title: 'What Studio is for',
      summary:
        'Studio is the guided route for custom briefs, sourcing support, and shape advice when you need help placing the right clay presence in a space.',
      href: '/studio',
      label: categoryLabel('studio'),
      keywords: uniqueKeywords([
        'studio',
        'custom order',
        'brief',
        'sourcing',
        'space advice',
      ]),
    },
  ];

  const aboutEntries: KnowledgeEntry[] = [
    {
      id: 'about:story',
      category: 'contact',
      kind: 'answer',
      title: aboutPage.title,
      summary: trimText(aboutPage.intro),
      href: '/about',
      label: categoryLabel('contact'),
      keywords: uniqueKeywords([
        aboutPage.eyebrow,
        aboutPage.title,
        aboutPage.intro,
        aboutPage.valuesBody,
        ...aboutPage.values,
      ]),
    },
  ];

  const contactEntries: KnowledgeEntry[] = [
    ...contactPage.info.map((item, index) => ({
      id: `contact:info:${index}`,
      category: 'contact' as const,
      kind: 'answer' as const,
      title: item.title,
      summary: trimText(item.text),
      href: '/contact',
      label: categoryLabel('contact'),
      keywords: uniqueKeywords([item.title, item.text, contactPage.title]),
    })),
    {
      id: 'contact:overview',
      category: 'contact',
      kind: 'answer',
      title: contactPage.title,
      summary: trimText(contactPage.intro),
      href: '/contact',
      label: categoryLabel('contact'),
      keywords: uniqueKeywords([
        contactPage.title,
        contactPage.intro,
        contactPage.formTitle,
        contactPage.responsePromiseBody,
      ]),
    },
  ];

  const policyEntries: KnowledgeEntry[] = [
    {
      id: 'policy:terms',
      category: 'policies',
      kind: 'answer',
      title: termsPage.title,
      summary: trimText(termsPage.intro),
      href: '/terms',
      label: categoryLabel('policies'),
      keywords: uniqueKeywords([
        termsPage.title,
        termsPage.intro,
        'terms',
        'website rules',
      ]),
    },
    {
      id: 'policy:privacy',
      category: 'policies',
      kind: 'answer',
      title: privacyPage.title,
      summary: trimText(privacyPage.intro),
      href: '/privacy-policy',
      label: categoryLabel('policies'),
      keywords: uniqueKeywords([
        privacyPage.title,
        privacyPage.intro,
        'privacy',
        'data',
        'personal information',
      ]),
    },
    {
      id: 'policy:cookies',
      category: 'policies',
      kind: 'answer',
      title: cookiePage.title,
      summary: trimText(cookiePage.intro),
      href: '/cookie-policy',
      label: categoryLabel('policies'),
      keywords: uniqueKeywords([
        cookiePage.title,
        cookiePage.intro,
        'cookies',
        'tracking',
        'analytics',
      ]),
    },
    {
      id: 'policy:delivery',
      category: 'policies',
      kind: 'answer',
      title: deliveryReturnsPage.title,
      summary: trimText(deliveryReturnsPage.intro),
      href: '/delivery-returns',
      label: categoryLabel('policies'),
      keywords: uniqueKeywords([
        deliveryReturnsPage.title,
        deliveryReturnsPage.intro,
        'returns',
        'refund',
        'delivery policy',
      ]),
    },
  ];

  return [
    ...productEntries,
    ...faqEntries,
    ...careEntries,
    ...troubleshootingEntries,
    ...deliveryEntries,
    ...accountEntries,
    ...studioEntries,
    ...aboutEntries,
    ...contactEntries,
    ...policyEntries,
  ];
}
