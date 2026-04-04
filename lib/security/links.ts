const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export function normalizeExternalUrl(value: string | null | undefined) {
  const nextValue = String(value || '').trim();

  if (!nextValue) {
    return '';
  }

  try {
    const parsed = new URL(nextValue);

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return '';
    }

    return parsed.toString();
  } catch {
    return '';
  }
}
