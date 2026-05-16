/**
 * inject-gallery-slots.js
 * Injects `gallerySlots` lines after each pot's `gallery:` line in lib/products.ts
 * Run: node scripts/inject-gallery-slots.js
 */
const fs = require('fs');
const manifest = JSON.parse(
  fs.readFileSync('C:/Users/Muti/Desktop/tulo_final/public/images/products/manifest.json', 'utf8')
);

// Map: the lifestyle-interior filename fragment → pot id (used to identify which gallery line = which pot)
const LIFESTYLE_TO_POT = {
  'kito-lifestyle-interior.jpg':      'kito',
  'ayo-lifestyle-interior.jpg':       'ayo',
  'zola-lifestyle-interior.jpg':      'zola',
  'safi-lifestyle-interior.jpg':      'safi',
  'tulo-noir-lifestyle-interior.jpg': 'tulo-noir',
  'tulo-terra-lifestyle-interior.jpg':'tulo-terra',
  'tulo-one-lifestyle-interior.jpg':  'tulo-one',
  'nuru-lifestyle-interior.jpg':      'nuru',
  'kora-lifestyle-interior.jpg':      'kora',
  'zuma-lifestyle-interior.jpg':      'zuma',
};

let src = fs.readFileSync('C:/Users/Muti/Desktop/tulo_final/lib/products.ts', 'utf8');
const lines = src.split('\n');
const outLines = [];
let patches = 0;

for (let i = 0; i < lines.length; i++) {
  outLines.push(lines[i]);

  // Check if this line is a gallery line that belongs to one of our new pots
  const line = lines[i];
  if (!line.trim().startsWith('gallery:[')) continue;

  // Identify which pot this gallery belongs to
  let potId = null;
  for (const [fragment, id] of Object.entries(LIFESTYLE_TO_POT)) {
    if (line.includes(fragment)) {
      potId = id;
      break;
    }
  }
  if (!potId) continue;

  // Check if next line already has gallerySlots (avoid double-insert)
  const nextLine = lines[i + 1] || '';
  if (nextLine.trim().startsWith('gallerySlots:')) continue;

  // Build gallerySlots object
  const slots = manifest[potId]?.slots || {};
  const entries = Object.entries(slots)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([k, v]) => `${k}: '${v}'`)
    .join(', ');

  // Match indentation of gallery line
  const indent = line.match(/^(\s*)/)[1];
  outLines.push(`${indent}gallerySlots: { ${entries} },`);
  patches++;
  console.log(`Patched: ${potId} (${Object.keys(slots).length} slots)`);
}

if (patches > 0) {
  fs.writeFileSync('C:/Users/Muti/Desktop/tulo_final/lib/products.ts', outLines.join('\n'));
  console.log(`\nSaved lib/products.ts (${patches} products updated)`);
} else {
  console.log('\nNo changes made — all already patched or no matches found.');
}
