/**
 * generate-image-manifest.ts
 *
 * Reads scripts/blob_urls.json and maps every image to a numbered slot (1–13)
 * using the filename conventions defined in lib/gallery-slots.ts.
 *
 * Outputs:
 *   public/images/products/manifest.json   — per-pot slot mapping (used at runtime)
 *   scripts/manifest-report.txt            — human-readable report of coverage
 *
 * Run: npx tsx scripts/generate-image-manifest.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ── slot mapping (mirrors lib/gallery-slots.ts without the TS module system) ─

const SLOT_LABEL: Record<number, string> = {
  1:  'Main cover (standard_soil_plant)',
  2:  'Empty pot (standard_pot_only)',
  3:  'Pot + soil only (standard_soil_only)',
  4:  'Second angle (standard_soil_plant_2)',
  5:  'Third angle',
  6:  'Fourth angle',
  7:  'Fifth angle',
  8:  'Sixth angle',
  9:  'Empty pot angle 2 (standard_pot_only_2)',
  10: 'Small size (small_soil_plant)',
  11: 'Medium size (medium_soil_plant)',
  12: 'Large size (large_soil_plant)',
  13: 'Large size angle 2 (large_soil_plant_2)',
};

const ALL_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function urlToSlot(url: string): number | null {
  const filename = url.split('/').pop() ?? '';
  const base = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');

  if (/_standard_soil_plant_6$/.test(base)) return 8;
  if (/_standard_soil_plant_5$/.test(base)) return 7;
  if (/_standard_soil_plant_4$/.test(base)) return 6;
  if (/_standard_soil_plant_3$/.test(base)) return 5;
  if (/_standard_soil_plant_2$/.test(base)) return 4;
  if (/_standard_soil_plant$/.test(base))   return 1;
  if (/_standard_pot_only_2$/.test(base))   return 9;
  if (/_standard_pot_only$/.test(base))     return 2;
  if (/_standard_soil_only$/.test(base))    return 3;
  if (/_large_soil_plant_2$/.test(base))    return 13;
  if (/_large_soil_plant$/.test(base))      return 12;
  if (/_medium_soil_plant$/.test(base))     return 11;
  if (/_small_soil_plant$/.test(base))      return 10;
  return null;
}

// ── known pot IDs ─────────────────────────────────────────────────────────────

const POT_IDS = [
  'ayo', 'kito', 'kora', 'nuru', 'safi',
  'tulo-noir', 'tulo-one', 'tulo-terra', 'zola', 'zuma',
];

// ── read blob_urls.json ───────────────────────────────────────────────────────

const blobUrlsPath = path.join(process.cwd(), 'scripts', 'blob_urls.json');
if (!fs.existsSync(blobUrlsPath)) {
  console.error('scripts/blob_urls.json not found. Run upload-to-blob.ts first.');
  process.exit(1);
}

const blobUrls: Record<string, string> = JSON.parse(fs.readFileSync(blobUrlsPath, 'utf8'));
const allBlobUrls = Object.values(blobUrls);

// ── build manifest ────────────────────────────────────────────────────────────

type PotManifest = {
  slots: Partial<Record<number, string>>;
  unslotted: string[];
};

const manifest: Record<string, PotManifest> = {};

for (const potId of POT_IDS) {
  const potUrls = allBlobUrls.filter((url) => {
    const filename = url.split('/').pop() ?? '';
    return filename.startsWith(potId + '_') || filename.startsWith(potId + '-');
  });

  const slots: Partial<Record<number, string>> = {};
  const unslotted: string[] = [];

  for (const url of potUrls) {
    const slot = urlToSlot(url);
    if (slot !== null && !slots[slot]) {
      slots[slot] = url;
    } else {
      unslotted.push(url);
    }
  }

  manifest[potId] = { slots, unslotted };
}

// ── write manifest.json ───────────────────────────────────────────────────────

const manifestPath = path.join(process.cwd(), 'public', 'images', 'products', 'manifest.json');
const manifestOut: Record<string, { slots: Record<string, string> }> = {};

for (const [potId, { slots }] of Object.entries(manifest)) {
  manifestOut[potId] = {
    slots: Object.fromEntries(
      Object.entries(slots).map(([slot, url]) => [slot, url ?? ''])
    ),
  };
}

fs.writeFileSync(manifestPath, JSON.stringify(manifestOut, null, 2));
console.log(`\nWrote manifest → ${manifestPath}`);

// ── write human-readable report ───────────────────────────────────────────────

const reportLines: string[] = [
  '=== Tulopots Image Manifest Report ===',
  `Generated: ${new Date().toISOString()}`,
  '',
];

const summary: string[] = [
  '\n=== COVERAGE SUMMARY ===',
  '',
  `${'Pot'.padEnd(14)} | ${ALL_SLOTS.map((n) => String(n).padStart(2)).join(' ')}`,
  `${'-'.repeat(14)}-+-${ALL_SLOTS.map(() => '--').join('-')}`,
];

for (const potId of POT_IDS) {
  const { slots, unslotted } = manifest[potId];

  reportLines.push(`\n${'='.repeat(60)}`);
  reportLines.push(`POT: ${potId}`);
  reportLines.push('='.repeat(60));

  for (const slot of ALL_SLOTS) {
    const url = slots[slot];
    const label = SLOT_LABEL[slot];
    if (url) {
      reportLines.push(`  Slot ${String(slot).padStart(2)}  ✓  ${label}`);
      reportLines.push(`         ${url.split('/').pop()}`);
    } else {
      reportLines.push(`  Slot ${String(slot).padStart(2)}  ✗  ${label}  — MISSING`);
    }
  }

  if (unslotted.length) {
    reportLines.push(`\n  Unslotted (${unslotted.length} images — environment shots, carousels, etc.):`);
    unslotted.slice(0, 10).forEach((url) => {
      reportLines.push(`    • ${url.split('/').pop()}`);
    });
    if (unslotted.length > 10) {
      reportLines.push(`    … and ${unslotted.length - 10} more`);
    }
  }

  // Summary row
  const row = ALL_SLOTS.map((n) => (slots[n] ? ' ✓' : ' ✗')).join(' ');
  summary.push(`${potId.padEnd(14)} | ${row}`);
}

reportLines.push(...summary);

const reportPath = path.join(process.cwd(), 'scripts', 'manifest-report.txt');
fs.writeFileSync(reportPath, reportLines.join('\n'));
console.log(`Wrote report   → ${reportPath}`);

// ── print summary to stdout ───────────────────────────────────────────────────

console.log('\n' + summary.join('\n'));

console.log(`
Slot legend:
  1=Main  2=Empty  3=SoilOnly  4-8=Angles  9=Empty2
  10=Small  11=Medium  12=Large  13=Large2

To populate a missing slot:
  • Generate the image and upload it to Vercel Blob
  • Name it [potId]_[variant].jpg per the naming convention
  • Re-run: npx tsx scripts/generate-image-manifest.ts
`);
