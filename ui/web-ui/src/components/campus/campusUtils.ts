import type { CampusCategory } from '@/api/types';

export interface CampusUtil {
  category: CampusCategory;
  label: string;
  subtitle: string;
  dot: string;
}

export const CAMPUS_UTILS: CampusUtil[] = [
  { category: 'dining', label: 'Dining', subtitle: "Hours & today's menu", dot: 'bg-sun' },
  { category: 'gym-hours', label: 'Gym', subtitle: 'Hours & facilities', dot: 'bg-sky' },
  { category: 'library', label: 'Library', subtitle: 'Hours today', dot: 'bg-sage' },
  { category: 'news', label: 'News', subtitle: 'Campus announcements', dot: 'bg-ink' },
];
