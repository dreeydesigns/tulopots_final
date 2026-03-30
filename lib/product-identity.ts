export function slugifyProduct(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function generateProductSku(input: {
  category: string;
  size: string;
  name: string;
}) {
  const category = (input.category || 'pots').slice(0, 3).toUpperCase();
  const size = (input.size || 'medium').slice(0, 2).toUpperCase();
  const nameBits = slugifyProduct(input.name || 'item')
    .split('-')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 3).toUpperCase());

  const tail = Date.now().toString().slice(-4);
  return ['TP', category, size, ...nameBits, tail].join('-');
}
