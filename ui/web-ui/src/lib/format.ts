import { parseLocalDateTime, type DateTimeValue } from './datetime';

export function formatDeparture(value: DateTimeValue): string {
  if (value == null) return '';
  const d = parseLocalDateTime(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDepartureLong(value: DateTimeValue): string {
  if (value == null) return '';
  const d = parseLocalDateTime(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(value: DateTimeValue): string {
  if (value == null) return '';
  const d = parseLocalDateTime(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function relativeTime(value: DateTimeValue): string {
  if (value == null) return '';
  const then = parseLocalDateTime(value).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function initialsOf(name: string | null | undefined, fallback = '?'): string {
  if (!name) return fallback;
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || fallback
  );
}
