/**
 * Gallery slot system — numbered 1–13
 *
 * Each product has up to 13 named image slots. Slots not populated are simply
 * omitted from the gallery. The slot numbers are stable identifiers that the
 * admin panel uses for manual assignment.
 */

export type GallerySlots = Partial<Record<number, string>>;

/** Human-readable label for each slot (used in admin UI) */
export const SLOT_LABEL: Record<number, string> = {
  1:  'Main cover',
  2:  'Empty pot',
  3:  'Pot + soil only',
  4:  'Second angle',
  5:  'Third angle',
  6:  'Fourth angle',
  7:  'Fifth angle',
  8:  'Sixth angle',
  9:  'Empty pot (angle 2)',
  10: 'Small size',
  11: 'Medium size',
  12: 'Large size',
  13: 'Large size (angle 2)',
};

/** One-line description shown below the slot label in admin */
export const SLOT_DESCRIPTION: Record<number, string> = {
  1:  'Pot + soil + plant on cream background — the main product cover',
  2:  'Empty pot, no soil, no plant — cream background',
  3:  'Pot filled with soil only, no plant — cream background',
  4:  'Second angle of the main cream-background shot',
  5:  'Third cream-background angle',
  6:  'Fourth cream-background angle',
  7:  'Fifth cream-background angle',
  8:  'Sixth cream-background angle',
  9:  'Second angle of empty-pot shot',
  10: 'Small sizing (≤25 cm) with soil + plant',
  11: 'Medium sizing (25–45 cm) with soil + plant',
  12: 'Large sizing (>45 cm) with soil + plant',
  13: 'Large sizing — second angle',
};

/** All 13 slot numbers in display order */
export const ALL_SLOTS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/**
 * Derive a slot number from a Blob URL / image path based on the filename
 * naming conventions used in this project. Returns null for environment shots
 * and other non-product images that have no slot.
 *
 * Naming conventions (root-level files):
 *   [pot]_standard_soil_plant.jpg       → 1
 *   [pot]_standard_pot_only.jpg         → 2
 *   [pot]_standard_soil_only.jpg        → 3
 *   [pot]_standard_soil_plant_2.jpg     → 4
 *   [pot]_standard_soil_plant_3.jpg     → 5
 *   [pot]_standard_soil_plant_4.jpg     → 6
 *   [pot]_standard_soil_plant_5.jpg     → 7
 *   [pot]_standard_soil_plant_6.jpg     → 8
 *   [pot]_standard_pot_only_2.jpg       → 9
 *
 * Naming conventions (gallery/ subfolder):
 *   [pot]_small_soil_plant.jpg          → 10
 *   [pot]_medium_soil_plant.jpg         → 11
 *   [pot]_large_soil_plant.jpg          → 12
 *   [pot]_large_soil_plant_2.jpg        → 13
 */
export function urlToSlot(url: string): number | null {
  const filename = url.split('/').pop() ?? '';
  const base = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');

  // Root-level patterns
  if (/_standard_soil_plant_6$/.test(base)) return 8;
  if (/_standard_soil_plant_5$/.test(base)) return 7;
  if (/_standard_soil_plant_4$/.test(base)) return 6;
  if (/_standard_soil_plant_3$/.test(base)) return 5;
  if (/_standard_soil_plant_2$/.test(base)) return 4;
  if (/_standard_soil_plant$/.test(base))   return 1;
  if (/_standard_pot_only_2$/.test(base))   return 9;
  if (/_standard_pot_only$/.test(base))     return 2;
  if (/_standard_soil_only$/.test(base))    return 3;

  // Gallery subfolder size-specific patterns
  if (/_large_soil_plant_2$/.test(base))    return 13;
  if (/_large_soil_plant$/.test(base))      return 12;
  if (/_medium_soil_plant$/.test(base))     return 11;
  if (/_small_soil_plant$/.test(base))      return 10;

  // Anything else (environment shots, carousels, interior shots) → no slot
  return null;
}

/**
 * Build an ordered gallery array from a `GallerySlots` object.
 * Slots without an image are skipped. Order is slot 1 first, 13 last.
 */
export function slotsToGallery(slots: GallerySlots): string[] {
  return ALL_SLOTS.flatMap((n) => {
    const url = slots[n];
    return url ? [url] : [];
  });
}

/**
 * Build a `GallerySlots` map from an existing flat gallery array using filename
 * pattern matching. Images that cannot be matched are appended after slot 13 as
 * "unslotted" extras (returned in the second element of the tuple).
 */
export function galleryToSlots(gallery: string[]): [GallerySlots, string[]] {
  const slots: GallerySlots = {};
  const unslotted: string[] = [];

  for (const url of gallery) {
    const slot = urlToSlot(url);
    if (slot !== null && !slots[slot]) {
      slots[slot] = url;
    } else {
      unslotted.push(url);
    }
  }

  return [slots, unslotted];
}
