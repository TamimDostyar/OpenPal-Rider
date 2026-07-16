import { parseLocalDateTime, type DateTimeValue } from './datetime';

export interface Countdown {
  value: number;
  unit: string;
  label: string;
  past: boolean;
}

export function countdownTo(value: DateTimeValue): Countdown | null {
  const target = parseLocalDateTime(value).getTime();
  if (Number.isNaN(target)) return null;
  const diffMs = target - Date.now();

  if (diffMs <= 0) return { value: 0, unit: '', label: 'departed', past: true };

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) return { value: days, unit: 'd', label: days === 1 ? 'day left' : 'days left', past: false };
  if (hours >= 1) return { value: hours, unit: 'h', label: hours === 1 ? 'hour left' : 'hours left', past: false };
  return {
    value: Math.max(1, minutes),
    unit: 'm',
    label: minutes === 1 ? 'min left' : 'mins left',
    past: false,
  };
}

export function countdownLabel(value: DateTimeValue): string | null {
  const target = parseLocalDateTime(value).getTime();
  if (Number.isNaN(target)) return null;
  const diffMs = target - Date.now();
  if (diffMs <= 0) return 'Departed';
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days} ${days === 1 ? 'day' : 'days'} left`;
  if (hours >= 1) return `${hours} ${hours === 1 ? 'hour' : 'hours'} left`;
  return `${Math.max(1, minutes)} ${minutes === 1 ? 'min' : 'mins'} left`;
}
