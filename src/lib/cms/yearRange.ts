/** Fitment year helpers: admin keeps a compact range; Shopify/storefront get discrete years. */

export const YEAR_PRESENT = 'present';
export const YEAR_ALL = 'All years';

const PRESENT_RE = /^(present|now|current|今年|至今|至今\/现在)$/i;
const ALL_RE = /^(all(\s+years?)?|全部|不限)$/i;
const YEAR_RE = /^(19|20)\d{2}$/;

export function currentYear(now = new Date()): number {
  return now.getFullYear();
}

export function isPresentToken(value: string): boolean {
  return PRESENT_RE.test(value.trim());
}

export function isAllYearsToken(value: string): boolean {
  return ALL_RE.test(value.trim());
}

export type YearRangeParts = {
  /** Empty when unset */
  from: string;
  /** Numeric year, "present", or "All years" */
  to: string;
};

/**
 * Parse admin / CSV year field into from/to parts.
 * Accepts: "2024-present", "2024 to present", "2024-2026", "2024", "All years".
 */
export function parseYearRange(raw: string): YearRangeParts {
  const text = raw.trim();
  if (!text) return { from: '', to: '' };
  if (isAllYearsToken(text)) return { from: '', to: YEAR_ALL };

  const normalized = text
    .replace(/[–—]/g, '-')
    .replace(/\s+to\s+/gi, '-')
    .replace(/\s*~\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  const rangeMatch = normalized.match(/^((?:19|20)\d{2})\s*-\s*(.+)$/i);
  if (rangeMatch) {
    const from = rangeMatch[1];
    const end = rangeMatch[2].trim();
    if (isPresentToken(end)) return { from, to: YEAR_PRESENT };
    if (YEAR_RE.test(end)) return { from, to: end };
  }

  if (YEAR_RE.test(normalized)) return { from: normalized, to: normalized };

  // Comma / slash lists → keep first..last for display; expand handles full list separately.
  const list = splitYearList(normalized);
  if (list.length >= 2 && list.every((y) => YEAR_RE.test(y))) {
    return { from: list[0], to: list[list.length - 1] };
  }
  if (list.length === 1 && YEAR_RE.test(list[0])) {
    return { from: list[0], to: list[0] };
  }

  return { from: text, to: text };
}

function splitYearList(text: string): string[] {
  return text
    .split(/[,/;|、]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Expand a year field into discrete calendar years for Shopify options / storefront chips.
 * - "2024-present" → [2024 … currentYear]
 * - "2024-2026" → [2024, 2025, 2026]
 * - "All years" → [] (means no year constraint; caller decides UI)
 * - "2024,2025" → [2024, 2025]
 */
export function expandYearRange(raw: string, now = new Date()): string[] {
  const text = raw.trim();
  if (!text) return [];
  if (isAllYearsToken(text)) return [];

  const list = splitYearList(text);
  if (list.length > 1 && !text.includes('-') && !/\bto\b/i.test(text)) {
    const years = list.filter((y) => YEAR_RE.test(y));
    if (years.length) return uniqueSortedYears(years);
  }

  const { from, to } = parseYearRange(text);
  if (!from && to === YEAR_ALL) return [];
  if (!YEAR_RE.test(from)) {
    // Already a single weird token (e.g. leftover "2024-present" that failed) — try numeric scrape
    const scraped = [...text.matchAll(/\b((?:19|20)\d{2})\b/g)].map((m) => m[1]);
    if (scraped.length >= 2) {
      return expandInclusive(Number(scraped[0]), Number(scraped[scraped.length - 1]));
    }
    if (scraped.length === 1 && isPresentToken(text.replace(scraped[0], '').replace(/[-–—to\s]/gi, ''))) {
      return expandInclusive(Number(scraped[0]), currentYear(now));
    }
    return scraped.length ? uniqueSortedYears(scraped) : [];
  }

  const start = Number(from);
  let end: number;
  if (to === YEAR_PRESENT || isPresentToken(to)) {
    end = currentYear(now);
  } else if (YEAR_RE.test(to)) {
    end = Number(to);
  } else if (!to || to === from) {
    end = start;
  } else {
    end = start;
  }

  return expandInclusive(start, end);
}

function expandInclusive(start: number, end: number): string[] {
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  const out: string[] = [];
  for (let y = lo; y <= hi; y++) out.push(String(y));
  return out;
}

function uniqueSortedYears(years: string[]): string[] {
  return [...new Set(years)].sort((a, b) => Number(b) - Number(a));
}

/** Compact form stored in admin / products.json */
export function formatYearRange(from: string, to: string): string {
  const f = from.trim();
  const t = to.trim();
  if (t === YEAR_ALL || isAllYearsToken(t)) return YEAR_ALL;
  if (!f && !t) return '';
  if (!f && YEAR_RE.test(t)) return t;
  if (YEAR_RE.test(f) && (!t || t === f)) return f;
  if (YEAR_RE.test(f) && (t === YEAR_PRESENT || isPresentToken(t))) return `${f}-${YEAR_PRESENT}`;
  if (YEAR_RE.test(f) && YEAR_RE.test(t)) {
    if (f === t) return f;
    return Number(f) <= Number(t) ? `${f}-${t}` : `${t}-${f}`;
  }
  return f || t;
}

/**
 * Collapse discrete year values (e.g. Shopify multi-variant import) back to a compact range.
 * If the max year equals the current calendar year, prefer `YYYY-present`.
 */
export function collapseYears(years: string[], now = new Date()): string {
  const cleaned = [...new Set(years.map((y) => y.trim()).filter((y) => YEAR_RE.test(y)))].sort(
    (a, b) => Number(a) - Number(b),
  );
  if (!cleaned.length) {
    if (years.some((y) => isAllYearsToken(y))) return YEAR_ALL;
    return years[0]?.trim() || '';
  }
  if (cleaned.length === 1) return cleaned[0];

  const start = Number(cleaned[0]);
  const end = Number(cleaned[cleaned.length - 1]);
  const consecutive = cleaned.every((y, i) => Number(y) === start + i);
  if (!consecutive) return cleaned.join(',');

  if (end === currentYear(now)) return `${start}-${YEAR_PRESENT}`;
  return `${start}-${end}`;
}

/** Year options for admin selects */
export function yearSelectOptions(span = 25, now = new Date()): string[] {
  const cy = currentYear(now);
  const out: string[] = [];
  for (let y = cy; y >= cy - span; y--) out.push(String(y));
  return out;
}
