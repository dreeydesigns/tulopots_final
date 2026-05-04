export type KnowledgeEntry = {
  title: string;
  route: string;
  text: string;
  tags?: string[];
};

export const CHAT_KNOWLEDGE: KnowledgeEntry[] = [
  {
    title: 'TuloPots Brand',
    route: '/',
    text: 'TuloPots is a Nairobi-based handcrafted terracotta brand. Every pot is hand-thrown from 100% natural Kenyan clay by skilled artisans in Nairobi. No two pieces are exactly alike. The brand focuses on premium handcrafted terracotta for indoor styling, outdoor spaces, pots only, and custom studio orders.',
    tags: ['home', 'brand', 'about', 'tulopots', 'nairobi', 'kenyan', 'clay', 'handmade', 'handcrafted'],
  },
  {
    title: 'Indoor Collection',
    route: '/indoor',
    text: 'The indoor collection includes handcrafted terracotta pots paired with indoor plants — perfect for living rooms, bedrooms, offices, kitchens, and studios. Indoor pots range from KSh 1,500 to KSh 4,800. Popular indoor pieces include the Zuri (Ribbed Globe with Peace Lily) at KSh 1,800, Amani (Jug Handle with Pothos) at KSh 2,800, Jua (Deep Planter with Bird of Paradise) at KSh 4,800, and Mara (Wide Rim with Monstera) at KSh 3,200.',
    tags: ['indoor', 'inside', 'living room', 'bedroom', 'office', 'kitchen', 'home', 'interior'],
  },
  {
    title: 'Outdoor Collection',
    route: '/outdoor',
    text: 'The outdoor collection features weather-resistant terracotta for patios, balconies, gardens, terraces, and courtyards. Outdoor pots range from KSh 2,200 to KSh 6,500. Bestsellers include the Studio XL Deep with Date Palm at KSh 6,500, Studio Collection with Agave & Aloe at KSh 4,500, Belly Pot Large with Lemon Tree at KSh 5,800, and Ribbed Globe XL with Bird of Paradise at KSh 5,200.',
    tags: ['outdoor', 'outside', 'garden', 'patio', 'balcony', 'terrace', 'courtyard', 'weather'],
  },
  {
    title: 'Pots Only / Clay Forms',
    route: '/pots',
    text: 'The Pots Only (Clay Forms) collection is for customers who already have plants and only want the terracotta pot. Prices start from KSh 800 for the Cylinder Vase up to KSh 6,500 for the Studio Workshop Set (4 mixed pots). Popular clay forms: Zuri Ribbed Globe at KSh 900, Nia Cylinder Vase at KSh 800, Amani Jug Handle at KSh 1,400, Imara Ribbed Cylinder at KSh 1,900, Sanaa Workshop Set (4 pots) at KSh 6,500.',
    tags: ['pots only', 'clay forms', 'without plant', 'empty pot', 'just pot', 'no plant', 'own plant'],
  },
  {
    title: 'Delivery & Shipping',
    route: '/delivery-returns',
    text: 'TuloPots delivers across Kenya. Nairobi standard delivery takes 2 business days. Free delivery on all Nairobi orders above KSh 5,000. Nationwide Kenya delivery is available with timelines that vary by location. No international shipping currently. You can track your order from the delivery page.',
    tags: ['delivery', 'shipping', 'nairobi', 'kenya', 'nationwide', 'free delivery', 'track', 'how long'],
  },
  {
    title: 'Payment Methods',
    route: '/cart',
    text: 'TuloPots accepts M-Pesa (STK push sent directly to your phone at checkout) and card payments via Visa or Mastercard through Stripe. Both methods are secure. If your M-Pesa payment failed, check your M-Pesa messages and retry from the cart page.',
    tags: ['payment', 'mpesa', 'm-pesa', 'card', 'visa', 'mastercard', 'stripe', 'checkout', 'pay', 'malipo'],
  },
  {
    title: 'Returns & Refunds',
    route: '/delivery-returns',
    text: 'TuloPots offers a 30-day satisfaction guarantee on all clay pieces. If your item arrives damaged or not as described, contact the team immediately. Refunds are processed within 5-7 business days. Decorative/sculptural pieces must be returned unused.',
    tags: ['return', 'refund', 'exchange', 'damaged', 'broken', 'wrong item', 'satisfaction', 'policy'],
  },
  {
    title: 'Studio / Custom Orders',
    route: '/studio',
    text: 'Studio Collection is for custom work, larger briefs, and unique commissions. Signed-in customers can upload inspiration images, share space dimensions, and describe their vision. Our master potter shapes pieces to the brief. Timeline is typically 2-4 weeks. Great for interior projects, large quantities, gift commissions, and unique dimensions.',
    tags: ['studio', 'custom', 'bulk', 'project', 'wholesale', 'commission', 'bespoke', 'special order'],
  },
  {
    title: 'Care Guide',
    route: '/care-guide',
    text: 'Terracotta is naturally porous and breathable — it dries faster than glazed pots. Clean with a damp cloth and soft brush; avoid harsh chemicals. Soak new terracotta in water for 30 minutes before first use. White salt deposits (efflorescence) are normal — remove with diluted white vinegar. All plant pots have drainage holes — always use a saucer indoors. Protect from freezing temperatures. Watering: succulents every 10-14 days, tropical/indoor plants weekly, outdoor plants 2x per week in hot weather.',
    tags: ['care', 'clean', 'terracotta', 'watering', 'drainage', 'maintenance', 'salt', 'yellow leaves', 'care guide'],
  },
  {
    title: 'FAQ',
    route: '/faq',
    text: 'Frequently asked questions: All pots are genuinely handmade in Nairobi. Clay is 100% natural Kenyan clay. Plant pots include drainage holes. You can buy pots without plants from the Clay Forms collection. Custom orders go through Studio. Return window is 30 days.',
    tags: ['faq', 'questions', 'answers', 'handmade', 'genuine', 'authentic'],
  },
  {
    title: 'Contact & Support',
    route: '/contact',
    text: 'The Contact page is for direct support, enquiries, and follow-up. You can also continue any conversation on WhatsApp with the TuloPots team for faster support. Admin email: andrew@tulopots.com.',
    tags: ['contact', 'support', 'help', 'email', 'phone', 'whatsapp', 'team', 'human'],
  },
  {
    title: 'Cart and Checkout',
    route: '/cart',
    text: 'Add items to your cart and proceed to checkout. The checkout supports M-Pesa (STK push) and card payment. If payment failed, return to the cart and retry. Orders above KSh 5,000 in Nairobi qualify for free delivery.',
    tags: ['cart', 'checkout', 'payment', 'order', 'buy', 'purchase', 'nunua'],
  },
  {
    title: 'Product Sizing Guide',
    route: '/pots',
    text: 'Pot sizes at TuloPots: Small pots (10-16cm diameter) suit tabletops, shelves, and desks. Medium pots (16-22cm) work for floor corners and larger surfaces. Large pots (24-38cm) are statement pieces for floor placement, patios, and gardens. The Studio Workshop Set includes 4 mixed sizes.',
    tags: ['size', 'small', 'medium', 'large', 'dimensions', 'how big', 'diameter', 'cm'],
  },
];

export const CHAT_FAQS = [
  {
    q: 'Are TuloPots really handmade?',
    a: 'Yes. Every single pot is hand-thrown on a potter\'s wheel by skilled artisans in Nairobi. No two pieces are exactly alike — each carries the subtle variations that make handcrafted pottery special.',
  },
  {
    q: 'What clay do you use?',
    a: 'We use 100% natural Kenyan clay sourced from local deposits. Our clay is processed and aged before shaping to ensure durability and a beautiful natural finish.',
  },
  {
    q: 'Can I buy pots without plants?',
    a: 'Yes. Visit /pots for the full Clay Forms (Pots Only) collection. Prices start from KSh 800 for the Nia Cylinder Vase.',
  },
  {
    q: 'Do you do custom orders?',
    a: 'Yes. Use /studio to begin a Studio Collection custom order brief. Upload inspiration images, share your space dimensions, and our master potter will shape pieces to your direction. Timeline is 2-4 weeks.',
  },
  {
    q: 'How do I clean terracotta?',
    a: 'Clean gently with a damp cloth and soft brush. Avoid harsh chemicals. White salt deposits are normal — remove with diluted white vinegar. Visit /care-guide for the full guide.',
  },
  {
    q: 'Do you deliver outside Nairobi?',
    a: 'Yes. TuloPots delivers across Kenya. Nairobi orders arrive in 2 business days. Free delivery on Nairobi orders above KSh 5,000. Nationwide delivery timelines vary by location.',
  },
  {
    q: 'What payment methods do you support?',
    a: 'M-Pesa (STK push to your phone) and card (Visa/Mastercard via Stripe). Both are available at checkout.',
  },
  {
    q: 'What is your return policy?',
    a: '30-day satisfaction guarantee on all clay pieces. If your item arrives damaged or not as described, contact the team. Refunds process in 5-7 business days.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Nairobi: 2 business days. Nationwide Kenya delivery timelines vary by location. Orders above KSh 5,000 in Nairobi get free delivery.',
  },
  {
    q: 'My M-Pesa payment failed',
    a: 'Check your M-Pesa messages for any pending requests. Return to your cart and retry payment. If the issue persists, try card payment or contact the TuloPots team.',
  },
];

export const SWAHILI_KEYWORDS: Record<string, string[]> = {
  bei: ['price', 'cost', 'how much'],
  tuma: ['send', 'deliver', 'shipping'],
  ununuzi: ['purchase', 'buy', 'checkout'],
  sufuria: ['pot', 'clay pot', 'container'],
  maua: ['flowers', 'plants', 'plant'],
  malipo: ['payment', 'pay', 'checkout'],
  kurudi: ['return', 'refund', 'exchange'],
  haraka: ['fast', 'quick', 'speed'],
  bure: ['free', 'no charge', 'complimentary'],
  karibu: ['welcome', 'hello', 'hi'],
  asante: ['thank you', 'thanks'],
  saidizi: ['help', 'support', 'assist'],
  amri: ['order', 'request', 'custom'],
  pia: ['also', 'too', 'and'],
  mji: ['city', 'nairobi', 'location'],
};
