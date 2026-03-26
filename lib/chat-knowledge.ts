export type KnowledgeEntry = {
  title: string;
  route: string;
  text: string;
  tags?: string[];
};

export const CHAT_KNOWLEDGE: KnowledgeEntry[] = [
  {
    title: 'Homepage',
    route: '/',
    text:
      'TuloPots is a Nairobi-based handcrafted terracotta brand. The brand focuses on premium handcrafted terracotta pots for indoor styling, outdoor spaces, pots only, and custom studio orders.',
    tags: ['home', 'brand', 'about', 'tulopots'],
  },
  {
    title: 'Indoor Collection',
    route: '/indoor',
    text:
      'The indoor collection includes handcrafted terracotta pots paired with indoor plants for living rooms, bedrooms, offices, kitchens, and studios.',
    tags: ['indoor', 'inside', 'living room', 'bedroom', 'office', 'kitchen', 'home'],
  },
  {
    title: 'Outdoor Collection',
    route: '/outdoor',
    text:
      'The outdoor collection includes stronger terracotta pots for patios, balconies, entrances, gardens, terraces, and courtyards.',
    tags: ['outdoor', 'outside', 'garden', 'patio', 'balcony', 'terrace', 'courtyard'],
  },
  {
    title: 'Pots Only',
    route: '/pots',
    text:
      'The Pots Only collection is for customers who already have their own plant and only want the terracotta pot.',
    tags: ['pots only', 'pot only', 'without plant', 'empty pot', 'just pot'],
  },
  {
    title: 'Care Guide',
    route: '/care-guide',
    text:
      'The Care Guide explains terracotta care, cleaning, drainage, watering, indoor care, outdoor care, and troubleshooting.',
    tags: ['care', 'clean', 'terracotta', 'watering', 'drainage', 'maintenance'],
  },
  {
    title: 'FAQ',
    route: '/faq',
    text:
      'The FAQ explains handmade quality, delivery, pots without plants, custom orders, returns, and terracotta basics.',
    tags: ['faq', 'questions', 'answers', 'delivery', 'custom', 'returns'],
  },
  {
    title: 'Studio Collection',
    route: '/studio',
    text:
      'Studio Collection is the custom and larger-order flow where customers can share inspiration, quantity, dimensions, and styling direction.',
    tags: ['studio', 'custom', 'bulk', 'project', 'wholesale', 'many pieces'],
  },
  {
    title: 'Contact',
    route: '/contact',
    text:
      'The Contact page is for direct support, enquiries, and follow-up from the TuloPots team.',
    tags: ['contact', 'support', 'help', 'email', 'phone'],
  },
  {
    title: 'Cart and Checkout',
    route: '/cart',
    text:
      'The website supports checkout with cart review, M-Pesa, and card payment flow.',
    tags: ['cart', 'checkout', 'payment', 'mpesa', 'm-pesa', 'card'],
  },
];

export const CHAT_FAQS = [
  {
    q: 'Are TuloPots really handmade?',
    a: 'Yes. Every pot is handcrafted in Nairobi, so each piece carries a natural handmade character.',
  },
  {
    q: 'Can I buy pots without plants?',
    a: 'Yes. Visit /pots for the full Pots Only collection.',
  },
  {
    q: 'Do you do custom orders?',
    a: 'Yes. Use /studio to begin a Studio Collection custom order brief.',
  },
  {
    q: 'How do I clean terracotta?',
    a: 'Clean gently with water and a soft cloth. Avoid harsh chemicals, and keep drainage open. You can also visit /care-guide.',
  },
  {
    q: 'Do you deliver outside Nairobi?',
    a: 'Yes. TuloPots delivers across Kenya. Nairobi delivery is usually easier and faster.',
  },
  {
    q: 'What payment methods do you support?',
    a: 'The website supports M-Pesa and card payments.',
  },
];