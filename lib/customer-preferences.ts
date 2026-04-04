export const DEFAULT_LANGUAGE = 'en' as const;
export const DEFAULT_CURRENCY = 'KES' as const;
export const DEFAULT_COUNTRY = 'KE' as const;

export const languageOptions = [
  { code: 'en', label: 'English', locale: 'en-KE' },
  { code: 'sw', label: 'Kiswahili', locale: 'sw-KE' },
  { code: 'fr', label: 'Français', locale: 'fr-FR' },
  { code: 'es', label: 'Español', locale: 'es-ES' },
  { code: 'de', label: 'Deutsch', locale: 'de-DE' },
  { code: 'it', label: 'Italiano', locale: 'it-IT' },
  { code: 'pt', label: 'Português', locale: 'pt-PT' },
  { code: 'ar', label: 'العربية', locale: 'ar-AE' },
  { code: 'hi', label: 'हिन्दी', locale: 'hi-IN' },
  { code: 'zh-CN', label: '简体中文', locale: 'zh-CN' },
] as const;

export const currencyOptions = [
  { code: 'KES', label: 'Kenyan Shilling', locale: 'en-KE', rateFromKes: 1, fractionDigits: 0 },
  { code: 'USD', label: 'US Dollar', locale: 'en-US', rateFromKes: 0.0077, fractionDigits: 2 },
  { code: 'EUR', label: 'Euro', locale: 'de-DE', rateFromKes: 0.0071, fractionDigits: 2 },
  { code: 'GBP', label: 'British Pound', locale: 'en-GB', rateFromKes: 0.0061, fractionDigits: 2 },
  { code: 'AED', label: 'UAE Dirham', locale: 'en-AE', rateFromKes: 0.0283, fractionDigits: 2 },
  { code: 'CAD', label: 'Canadian Dollar', locale: 'en-CA', rateFromKes: 0.0105, fractionDigits: 2 },
  { code: 'AUD', label: 'Australian Dollar', locale: 'en-AU', rateFromKes: 0.0118, fractionDigits: 2 },
  { code: 'INR', label: 'Indian Rupee', locale: 'en-IN', rateFromKes: 0.64, fractionDigits: 2 },
  { code: 'ZAR', label: 'South African Rand', locale: 'en-ZA', rateFromKes: 0.14, fractionDigits: 2 },
  { code: 'JPY', label: 'Japanese Yen', locale: 'ja-JP', rateFromKes: 1.17, fractionDigits: 0 },
] as const;

export const countryOptions = [
  { code: 'KE', label: 'Kenya', currency: 'KES' },
  { code: 'US', label: 'United States', currency: 'USD' },
  { code: 'GB', label: 'United Kingdom', currency: 'GBP' },
  { code: 'AE', label: 'United Arab Emirates', currency: 'AED' },
  { code: 'CA', label: 'Canada', currency: 'CAD' },
  { code: 'AU', label: 'Australia', currency: 'AUD' },
  { code: 'IN', label: 'India', currency: 'INR' },
  { code: 'ZA', label: 'South Africa', currency: 'ZAR' },
  { code: 'JP', label: 'Japan', currency: 'JPY' },
  { code: 'DE', label: 'Germany', currency: 'EUR' },
  { code: 'FR', label: 'France', currency: 'EUR' },
] as const;

export type SupportedLanguage = (typeof languageOptions)[number]['code'];
export type SupportedCurrency = (typeof currencyOptions)[number]['code'];
export type SupportedCountry = (typeof countryOptions)[number]['code'];

export function resolveSupportedLanguage(value: string | null | undefined): SupportedLanguage {
  return (
    languageOptions.find((option) => option.code === value)?.code || DEFAULT_LANGUAGE
  );
}

export function resolveSupportedCurrency(value: string | null | undefined): SupportedCurrency {
  return (
    currencyOptions.find((option) => option.code === value)?.code || DEFAULT_CURRENCY
  );
}

export function resolveSupportedCountry(value: string | null | undefined): SupportedCountry {
  return (
    countryOptions.find((option) => option.code === value)?.code || DEFAULT_COUNTRY
  );
}

export function getLanguageMeta(language: string | null | undefined) {
  const resolved = resolveSupportedLanguage(language);
  return (
    languageOptions.find((option) => option.code === resolved) || languageOptions[0]
  );
}

export function getCurrencyMeta(currency: string | null | undefined) {
  const resolved = resolveSupportedCurrency(currency);
  return (
    currencyOptions.find((option) => option.code === resolved) || currencyOptions[0]
  );
}

export function getCountryMeta(country: string | null | undefined) {
  const resolved = resolveSupportedCountry(country);
  return (
    countryOptions.find((option) => option.code === resolved) || countryOptions[0]
  );
}

export function currencyForCountry(country: string | null | undefined): SupportedCurrency {
  return resolveSupportedCurrency(getCountryMeta(country).currency);
}

export function isKenyanCountry(country: string | null | undefined) {
  return resolveSupportedCountry(country) === 'KE';
}

export function isNairobiCbdLocation(city: string | null | undefined) {
  const value = String(city || '')
    .trim()
    .toLowerCase();

  if (!value) {
    return false;
  }

  return value.includes('nairobi cbd') || value === 'cbd';
}

function roundAmount(value: number, fractionDigits: number) {
  const factor = 10 ** fractionDigits;
  return Math.round(value * factor) / factor;
}

export function convertKesAmount(
  amountKes: number,
  currency: string | null | undefined
) {
  const meta = getCurrencyMeta(currency);

  if (meta.code === 'KES') {
    return Math.round(amountKes);
  }

  return roundAmount(amountKes * meta.rateFromKes, meta.fractionDigits);
}

export function formatKesMoney(
  amountKes: number,
  options: {
    currency?: string | null;
    language?: string | null;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
) {
  const currencyMeta = getCurrencyMeta(options.currency);
  const languageMeta = getLanguageMeta(options.language);
  const locale = currencyMeta.locale || languageMeta.locale;
  const minimumFractionDigits =
    options.minimumFractionDigits ?? currencyMeta.fractionDigits;
  const maximumFractionDigits =
    options.maximumFractionDigits ?? currencyMeta.fractionDigits;
  const amount =
    currencyMeta.code === 'KES'
      ? Math.round(amountKes)
      : convertKesAmount(amountKes, currencyMeta.code);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyMeta.code,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

export function getDeliveryFeeKes(input: {
  subtotalKes: number;
  itemCount: number;
  shippingCountry?: string | null;
  shippingCity?: string | null;
}) {
  if (!input.itemCount) {
    return 0;
  }

  if (isKenyanCountry(input.shippingCountry)) {
    if (isNairobiCbdLocation(input.shippingCity) && input.subtotalKes >= 7000) {
      return 0;
    }

    return 350;
  }

  return input.subtotalKes >= 20000 ? 1800 : 2800;
}

export function getDeliverySummary(input: {
  subtotalKes: number;
  itemCount: number;
  shippingCountry?: string | null;
  shippingCity?: string | null;
}) {
  const deliveryFeeKes = getDeliveryFeeKes(input);
  const totalKes = input.subtotalKes + deliveryFeeKes;
  const isInternational = !isKenyanCountry(input.shippingCountry);
  const isNairobiCbd = isNairobiCbdLocation(input.shippingCity);
  const qualifiesForFreeNairobiCbdDelivery =
    !isInternational && isNairobiCbd && input.subtotalKes >= 7000;
  const requiresLocationQuote = !isInternational && !isNairobiCbd;

  return {
    subtotalKes: input.subtotalKes,
    deliveryFeeKes,
    totalKes,
    isInternational,
    isNairobiCbd,
    qualifiesForFreeNairobiCbdDelivery,
    requiresLocationQuote,
    policyNote: isInternational
      ? 'International delivery is estimated separately for the destination country.'
      : qualifiesForFreeNairobiCbdDelivery
      ? 'Nairobi CBD delivery is free for orders above KES 7,000.'
      : requiresLocationQuote
      ? 'Delivery starts at KES 350 for Nairobi CBD. Further Nairobi and upcountry locations may cost more after routing review.'
      : 'Delivery to Nairobi CBD is KES 350. Orders above KES 7,000 ship free within Nairobi CBD.',
  };
}

export function getLanguageLabel(language: string | null | undefined) {
  return getLanguageMeta(language).label;
}

export function getCountryLabel(country: string | null | undefined) {
  return getCountryMeta(country).label;
}

export function getCurrencyLabel(currency: string | null | undefined) {
  return getCurrencyMeta(currency).label;
}
