/**
 * Departure times reach the browser in two shapes depending on the backend's
 * JSON serializer: a Jackson array ([2026, 7, 16, 16, 0]) or a zoneless ISO
 * string ("2026-07-16T16:00:00"). Both mean "this wall-clock time where the
 * rider is".
 *
 * `new Date(value)` handles neither reliably: it returns Invalid Date for the
 * array form, and treats an offset-less ISO string as UTC in some engines —
 * so a near-term ride can wrongly read as already departed depending on the
 * viewer's timezone relative to the server's.
 *
 * These helpers parse either shape into the browser's local timezone so the
 * displayed time and countdown are always relative to where the user is.
 */

// "2026-07-16T16:00:00" / "2026-07-16 16:00" (no trailing Z or +hh:mm offset).
const ZONELESS_ISO = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/;

export type DateTimeValue = string | number | number[] | null | undefined;

/**
 * Parse a departure value into a Date anchored to the browser's local
 * timezone. Returns an invalid Date (NaN) for values that can't be understood.
 */
export function parseLocalDateTime(value: DateTimeValue): Date {
  if (value == null) return new Date(NaN);

  // Jackson-as-array fallback: [year, month(1-12), day, hour, minute, ...].
  if (Array.isArray(value)) {
    return new Date(
      value[0],
      (value[1] ?? 1) - 1,
      value[2] ?? 1,
      value[3] ?? 0,
      value[4] ?? 0,
    );
  }

  if (typeof value === 'number') return new Date(value * 1000);

  const str = String(value).trim();
  const m = ZONELESS_ISO.exec(str);
  if (m) {
    // Build from components so the string is read as local wall-clock time,
    // instead of being silently treated as UTC.
    return new Date(
      Number(m[1]), Number(m[2]) - 1, Number(m[3]),
      Number(m[4]), Number(m[5]), m[6] ? Number(m[6]) : 0,
    );
  }
  // Anything with an explicit zone (…Z / …+hh:mm) is unambiguous.
  return new Date(str);
}

/** True when the value parses to a real date. */
export function isValidDateTime(value: DateTimeValue): boolean {
  return !Number.isNaN(parseLocalDateTime(value).getTime());
}

/** Milliseconds from now until `value`; negative once it's in the past. */
export function msUntil(value: DateTimeValue): number {
  return parseLocalDateTime(value).getTime() - Date.now();
}

/** Format a value for an `<input type="datetime-local">` default value. */
export function toDatetimeLocalValue(value: DateTimeValue): string {
  const d = parseLocalDateTime(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
