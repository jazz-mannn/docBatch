const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

export function sanitizeFilename(value: string, fallback = 'document'): string {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    .replace(/\s+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/\.+$/g, '')
    .replace(/^\.+/g, '')
    .slice(0, 120);

  if (!cleaned || WINDOWS_RESERVED.test(cleaned)) {
    return fallback;
  }

  return cleaned;
}

export function uniqueFilename(base: string, used: Set<string>): string {
  let candidate = base;
  let suffix = 2;

  while (used.has(candidate.toLowerCase())) {
    candidate = `${base}_${suffix}`;
    suffix += 1;
  }

  used.add(candidate.toLowerCase());
  return candidate;
}
