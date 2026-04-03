function asHttpsUrl(hostname?: string | null) {
  const value = String(hostname || '').trim();
  return value ? `https://${value.replace(/^https?:\/\//, '')}` : null;
}

export const BRAND = {
  name: 'TuloPots',
  tagline: 'Handcrafted Terracotta from Kenya',
  phone: '+254743817931',
  emailPrimary: 'hello@tulopots.com',
  emailSecondary: 'tulopots@outlook.com'
};

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  asHttpsUrl(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ||
  asHttpsUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  'https://tulopots-final.vercel.app';

export const imageByKey = {
  hero: '/images/catalog/workshop-pottery-shelf.jpg',
  indoor1: '/images/catalog/karen-ribbed-globe-peace-lily.jpg',
  indoor2: '/images/catalog/muthaiga-pedestal-bowl-succulents.jpg',
  indoor3: '/images/catalog/runda-cylinder-snake-plant.jpg',
  indoor4: '/images/catalog/lavington-jug-pothos.jpg',
  outdoor1: '/images/catalog/vipingo-bougainvillea-pot.jpg',
  outdoor2: '/images/catalog/muthaiga-hut-sculpture.jpg',
  outdoor3: '/images/catalog/kitisuru-ribbed-cylinder.jpg',
  outdoor4: '/images/catalog/rosslyn-tapered-vase.jpg',
  historyPresence: '/images/history/history-presence.svg',
  historyNairobi: '/images/history/history-nairobi.svg',
  historyWheel: '/images/history/history-wheel.svg',
  historyHome: '/images/history/history-home.svg',
  clay: '/images/catalog/workshop-pottery-shelf.jpg',
  productStudio: '/images/catalog/kitisuru-ribbed-cylinder.jpg',
  contact: '/images/catalog/workshop-pottery-shelf.jpg',
  workshop: '/images/catalog/workshop-pottery-shelf.jpg'
};
