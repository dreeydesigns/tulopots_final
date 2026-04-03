export function slugifyProduct(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function shortCode(value: string, maxLength: number) {
  const normalized = slugifyProduct(value)
    .split('-')
    .filter(Boolean)
    .join('');

  return (normalized || 'item').slice(0, maxLength).toUpperCase();
}

function sizeCode(value: string) {
  const normalized = String(value || '').toLowerCase();

  if (normalized.startsWith('sm')) return 'SM';
  if (normalized.startsWith('me')) return 'MD';
  if (normalized.startsWith('la')) return 'LG';
  if (normalized.startsWith('de')) return 'DC';
  if (normalized.startsWith('set')) return 'SET';

  return shortCode(normalized, 3);
}

function hashFragment(value: string) {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return String(hash % 1000).padStart(3, '0');
}

export function generateProductSku(input: {
  category: string;
  size: string;
  name: string;
}) {
  const category = shortCode(input.category || 'pots', 3);
  const size = sizeCode(input.size || 'medium');
  const nameBits = slugifyProduct(input.name || 'item')
    .split('-')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 4).toUpperCase());

  const tail = hashFragment(`${category}-${size}-${slugifyProduct(input.name || 'item')}`);
  return ['TP', category, size, ...(nameBits.length ? nameBits : ['ITEM']), tail].join('-');
}
