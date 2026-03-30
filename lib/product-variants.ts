export type ProductMode = 'plant' | 'pot';
export type ProductSizeKey = 'small' | 'medium' | 'large' | 'xl' | 'set';

export type ProductSizeOption = {
  key: ProductSizeKey;
  label: string;
  helper: string;
  multiplier: number;
};

export type ProductSizeMedia = {
  image: string;
  gallery: string[];
};

export type ProductModeContent = {
  name: string;
  short: string;
  description: string;
  cardDescription: string;
  price: number;
  image: string;
  gallery: string[];
  sizeMedia?: Partial<Record<ProductSizeKey, ProductSizeMedia>>;
};

export type ProductModeContentMap = Partial<Record<ProductMode, ProductModeContent>>;

export type ProductVariantSource = {
  category: string;
  size: string;
  name: string;
  short: string;
  description: string;
  cardDescription: string;
  image: string;
  gallery?: string[] | null;
  price: number;
  potOnly: number | null;
  forcePotOnly?: boolean;
  decorative?: boolean;
  details?: Record<string, unknown> | null;
  availableSizes?: unknown;
  modeContent?: unknown;
};

const SIZE_ORDER: ProductSizeKey[] = ['small', 'medium', 'large', 'xl', 'set'];

const SIZE_LIBRARY: Record<ProductSizeKey, Omit<ProductSizeOption, 'multiplier'>> = {
  small: { key: 'small', label: 'Small', helper: 'Great for desks' },
  medium: { key: 'medium', label: 'Medium', helper: 'Most popular size' },
  large: { key: 'large', label: 'Large', helper: 'Nice for floors' },
  xl: { key: 'xl', label: 'Extra Large', helper: 'Best for patios' },
  set: { key: 'set', label: 'Studio Set', helper: 'Set of 4 pots' },
};

const PROFILE_DEFAULTS: Record<string, ProductSizeKey[]> = {
  small: ['small', 'medium', 'large'],
  medium: ['small', 'medium', 'large', 'xl'],
  large: ['medium', 'large', 'xl'],
  decorative: ['small', 'medium', 'large'],
  sets: ['set'],
};

const LEAD_SIZE_BY_PROFILE: Record<string, ProductSizeKey> = {
  small: 'small',
  medium: 'medium',
  large: 'large',
  decorative: 'medium',
  sets: 'set',
};

export const adminAvailableSizeOptions = SIZE_ORDER.map((key) => ({
  key,
  label: SIZE_LIBRARY[key].label,
  helper: SIZE_LIBRARY[key].helper,
}));

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function trimString(value: unknown, fallback = '') {
  const nextValue = String(value ?? fallback).trim();
  return nextValue || fallback;
}

function numericValue(value: unknown, fallback = 0) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function sortSizeKeys(keys: ProductSizeKey[]) {
  return [...new Set(keys)].sort(
    (left, right) => SIZE_ORDER.indexOf(left) - SIZE_ORDER.indexOf(right)
  );
}

function sanitizeGallery(value: unknown, fallbackImage = '') {
  const gallery = Array.isArray(value)
    ? value.map((entry) => trimString(entry)).filter(Boolean)
    : [];

  if (gallery.length) {
    return [...new Set(gallery)];
  }

  return fallbackImage ? [fallbackImage] : [];
}

function baseSizeKeysForProfile(profile: string) {
  return PROFILE_DEFAULTS[profile] || PROFILE_DEFAULTS.medium;
}

function derivePotName(name: string) {
  const trimmed = trimString(name);
  const cleaned = trimmed.replace(/\s+with\s+.+$/i, '').trim();
  return cleaned || trimmed;
}

function derivePotShort(
  short: string,
  details?: Record<string, unknown> | null,
  fallback = 'Clay form only'
) {
  const shape = trimString(details?.shape);
  const finish = trimString(details?.finish || 'Natural Terracotta');
  const trimmed = trimString(short);

  if (trimmed && !/^with\s+/i.test(trimmed)) {
    return trimmed;
  }

  if (shape && finish) {
    return `${shape} · ${finish}`;
  }

  if (shape) {
    return `${shape} · Clay Form`;
  }

  return fallback;
}

function defaultPotDescription(
  details?: Record<string, unknown> | null,
  fallback = 'Choose the clay form on its own and pair it with your own planting direction.'
) {
  const shape = trimString(details?.shape);
  if (!shape) {
    return fallback;
  }

  return `Choose the ${shape.toLowerCase()} on its own and pair it with your own planting direction.`;
}

function defaultPotCardDescription(
  details?: Record<string, unknown> | null,
  fallback = 'Clay form only, ready for your own styling.'
) {
  const shape = trimString(details?.shape);
  if (!shape) {
    return fallback;
  }

  return `${shape} only, ready for your own styling.`;
}

function buildDefaultModeContent(
  product: ProductVariantSource,
  mode: ProductMode
): ProductModeContent {
  const baseGallery = sanitizeGallery(product.gallery, trimString(product.image));
  const baseImage = trimString(product.image || baseGallery[0]);
  const isPotPrimary = product.category === 'pots' || product.forcePotOnly || product.decorative;

  if (mode === 'plant') {
    return {
      name: trimString(product.name),
      short: trimString(product.short),
      description: trimString(product.description),
      cardDescription: trimString(product.cardDescription || product.short || product.description),
      price: numericValue(product.price),
      image: baseImage,
      gallery: baseGallery,
      sizeMedia: {},
    };
  }

  return {
    name: derivePotName(product.name),
    short: derivePotShort(product.short, product.details),
    description: isPotPrimary
      ? trimString(product.description)
      : defaultPotDescription(product.details),
    cardDescription: isPotPrimary
      ? trimString(product.cardDescription || product.short || product.description)
      : defaultPotCardDescription(product.details),
    price: numericValue(
      product.potOnly == null ? (isPotPrimary ? product.price : 0) : product.potOnly
    ),
    image: baseImage,
    gallery: baseGallery,
    sizeMedia: {},
  };
}

function normalizeSizeMedia(
  rawValue: unknown,
  fallbackImage: string,
  fallbackGallery: string[]
) {
  if (!isRecord(rawValue)) {
    return {};
  }

  const nextValue: Partial<Record<ProductSizeKey, ProductSizeMedia>> = {};

  for (const key of SIZE_ORDER) {
    const entry = rawValue[key];

    if (!isRecord(entry)) {
      continue;
    }

    const image = trimString(entry.image || fallbackImage);
    const gallery = sanitizeGallery(entry.gallery, image || fallbackImage);

    if (!image && !gallery.length) {
      continue;
    }

    nextValue[key] = {
      image: image || gallery[0] || fallbackImage,
      gallery: gallery.length ? gallery : fallbackGallery,
    };
  }

  return nextValue;
}

function normalizeModeEntry(rawValue: unknown, fallback: ProductModeContent) {
  if (!isRecord(rawValue)) {
    return fallback;
  }

  const image = trimString(rawValue.image || fallback.image);
  const gallery = sanitizeGallery(rawValue.gallery, image || fallback.image);

  return {
    name: trimString(rawValue.name || fallback.name),
    short: trimString(rawValue.short || fallback.short),
    description: trimString(rawValue.description || fallback.description),
    cardDescription: trimString(
      rawValue.cardDescription || fallback.cardDescription || fallback.description
    ),
    price: numericValue(rawValue.price, fallback.price),
    image: image || gallery[0] || fallback.image,
    gallery: gallery.length ? gallery : fallback.gallery,
    sizeMedia: normalizeSizeMedia(
      rawValue.sizeMedia,
      image || fallback.image,
      gallery.length ? gallery : fallback.gallery
    ),
  };
}

export function normalizeAvailableSizes(value: unknown, sizeProfile: string) {
  const rawKeys = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  const keys = rawKeys
    .map((entry) => trimString(entry).toLowerCase())
    .filter((entry): entry is ProductSizeKey =>
      SIZE_ORDER.includes(entry as ProductSizeKey)
    );

  if (keys.length) {
    return sortSizeKeys(keys);
  }

  return sortSizeKeys(baseSizeKeysForProfile(sizeProfile));
}

export function sizeOptionsFor(product: Pick<ProductVariantSource, 'size' | 'availableSizes'>) {
  const availableSizes = normalizeAvailableSizes(product.availableSizes, product.size);
  const multiplierBySize: Record<ProductSizeKey, number> =
    product.size === 'sets'
      ? { small: 1, medium: 1, large: 1, xl: 1, set: 1 }
      : product.size === 'decorative'
        ? { small: 1, medium: 1.18, large: 1.35, xl: 1.35, set: 1 }
        : product.size === 'small'
          ? { small: 1, medium: 1.2, large: 1.42, xl: 1.42, set: 1 }
          : product.size === 'medium'
            ? { small: 0.9, medium: 1, large: 1.22, xl: 1.45, set: 1 }
            : { small: 0.82, medium: 0.82, large: 1, xl: 1.2, set: 1 };

  return availableSizes.map((key) => ({
    ...SIZE_LIBRARY[key],
    multiplier: multiplierBySize[key],
  }));
}

export function normalizeModeContent(product: ProductVariantSource): ProductModeContentMap {
  const rawValue = isRecord(product.modeContent) ? product.modeContent : {};
  const supportsPlant = !product.forcePotOnly && !product.decorative && product.category !== 'pots';

  const nextValue: ProductModeContentMap = {};

  if (supportsPlant || rawValue.plant) {
    nextValue.plant = normalizeModeEntry(rawValue.plant, buildDefaultModeContent(product, 'plant'));
  }

  nextValue.pot = normalizeModeEntry(rawValue.pot, buildDefaultModeContent(product, 'pot'));

  return nextValue;
}

export function getLeadSizeKey(
  sizeProfile: string,
  availableSizes: ProductSizeKey[]
): ProductSizeKey {
  const preferredKey = LEAD_SIZE_BY_PROFILE[sizeProfile] || 'medium';
  if (availableSizes.includes(preferredKey)) {
    return preferredKey;
  }

  if (availableSizes.includes('medium')) {
    return 'medium';
  }

  return availableSizes[0] || 'medium';
}

export function getModeMedia(
  modeContent: ProductModeContent | undefined,
  sizeKey: ProductSizeKey,
  fallbackImage = ''
) {
  const fallbackGallery = sanitizeGallery(modeContent?.gallery, modeContent?.image || fallbackImage);
  const sizeMedia = modeContent?.sizeMedia?.[sizeKey];
  const sizeGallery = sanitizeGallery(
    sizeMedia?.gallery,
    sizeMedia?.image || modeContent?.image || fallbackImage
  );

  if (sizeMedia?.image || sizeGallery.length) {
    return {
      image: trimString(sizeMedia?.image || sizeGallery[0] || modeContent?.image || fallbackImage),
      gallery: sizeGallery.length ? sizeGallery : fallbackGallery,
    };
  }

  return {
    image: trimString(modeContent?.image || fallbackGallery[0] || fallbackImage),
    gallery: fallbackGallery,
  };
}

export function getAvailableModes(product: ProductVariantSource) {
  const modeContent = normalizeModeContent(product);
  const modes: ProductMode[] = [];

  if (modeContent.plant && modeContent.plant.price > 0) {
    modes.push('plant');
  }

  if (modeContent.pot && modeContent.pot.price > 0) {
    modes.push('pot');
  }

  if (!modes.length) {
    return product.category === 'pots' || product.forcePotOnly || product.decorative
      ? (['pot'] as ProductMode[])
      : (['plant', 'pot'] as ProductMode[]);
  }

  return modes;
}

export function buildStoredProductFields(product: ProductVariantSource) {
  const availableSizes = normalizeAvailableSizes(product.availableSizes, product.size);
  const modeContent = normalizeModeContent({
    ...product,
    availableSizes,
  });
  const leadSize = getLeadSizeKey(product.size, availableSizes);
  const defaultMode: ProductMode =
    product.category === 'pots' || product.forcePotOnly || product.decorative
      ? 'pot'
      : modeContent.plant && modeContent.plant.price > 0
        ? 'plant'
        : 'pot';
  const primaryMode = modeContent[defaultMode] || modeContent.plant || modeContent.pot;
  const primaryMedia = getModeMedia(primaryMode, leadSize, product.image);
  const plantPrice = modeContent.plant?.price ?? 0;
  const potPrice = modeContent.pot?.price ?? 0;

  return {
    availableSizes,
    modeContent,
    leadSize,
    name: trimString(primaryMode?.name || product.name),
    short: trimString(primaryMode?.short || product.short),
    description: trimString(primaryMode?.description || product.description),
    cardDescription: trimString(
      primaryMode?.cardDescription || product.cardDescription || product.description
    ),
    image: trimString(primaryMedia.image || product.image),
    gallery: primaryMedia.gallery.length
      ? primaryMedia.gallery
      : sanitizeGallery(product.gallery, trimString(product.image)),
    price:
      product.category === 'pots' || product.forcePotOnly || product.decorative
        ? Math.max(potPrice, primaryMode?.price || 0)
        : Math.max(plantPrice, primaryMode?.price || 0),
    potOnly:
      product.category === 'pots' || product.forcePotOnly || product.decorative || !potPrice
        ? null
        : potPrice,
  };
}

export function resolveProductPresentation(
  product: ProductVariantSource,
  requestedMode: ProductMode,
  requestedSize?: string
) {
  const sizes = sizeOptionsFor(product);
  const availableSizes = sizes.map((size) => size.key);
  const sizeKey =
    availableSizes.find((key) => key === requestedSize) ||
    getLeadSizeKey(product.size, availableSizes);
  const availableModes = getAvailableModes(product);
  const mode = availableModes.includes(requestedMode)
    ? requestedMode
    : availableModes[0] || 'pot';
  const modeContent = normalizeModeContent(product);
  const currentContent =
    modeContent[mode] || modeContent.plant || modeContent.pot || buildDefaultModeContent(product, 'pot');
  const currentSize =
    sizes.find((size) => size.key === sizeKey) || sizes[0] || SIZE_LIBRARY.medium;
  const media = getModeMedia(currentContent, currentSize.key, product.image);

  return {
    mode,
    availableModes,
    sizes,
    currentSize,
    currentContent: {
      ...currentContent,
      image: media.image,
      gallery: media.gallery,
    },
    unitPrice: Math.round(numericValue(currentContent.price) * currentSize.multiplier),
  };
}
