import type { ReactNode } from 'react';
import { api } from '@/api/client';
import type { CampusCategory, MenuDaypart, ScrapeItem } from '@/api/types';
import { useApiData } from '@/hooks/useApi';
import { Modal } from '@/components/ui/Modal';
import { Banner } from '@/components/ui/Banner';

interface CampusUtilityModalProps {
  category: CampusCategory;
  title: string;
  subtitle: string;
  school: string;
  onClose: () => void;
}

interface DiningData {
  menu: MenuDaypart[];
  hours: ScrapeItem[];
}

export function CampusUtilityModal({ category, title, subtitle, school, onClose }: CampusUtilityModalProps) {
  const { data, loading, error } = useApiData(async () => {
    if (category === 'dining') {
      const [menu, hours] = await Promise.all([
        api.schools.menu(school),
        api.schools.byCategory(school, 'cafe-hours'),
      ]);
      return { kind: 'dining' as const, dining: { menu, hours } };
    }
    const items = await api.schools.byCategory(school, category);
    return { kind: 'items' as const, items };
  }, [category, school]);

  const dining = data?.kind === 'dining' ? data.dining : null;
  const items = data?.kind === 'items' ? data.items : null;
  const isEmpty = category === 'dining' ? !!dining && dining.menu.length === 0 && dining.hours.length === 0 : !!items && items.length === 0;

  return (
    <Modal title={title} onClose={onClose}>
      <div className="flex flex-col gap-3.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {subtitle} · {school}
        </p>

        {error ? <Banner tone="error">{error}</Banner> : null}

        {loading ? (
          <div className="flex flex-col gap-3">
            <div className="skeleton h-24 w-full rounded-2xl" />
            <div className="skeleton h-24 w-full rounded-2xl" />
          </div>
        ) : !error && isEmpty ? (
          <p className="py-12 text-center text-sm text-muted">Nothing to show right now.</p>
        ) : category === 'dining' && dining ? (
          <DiningView data={dining} />
        ) : items ? (
          <CategoryBody category={category} items={items} />
        ) : null}
      </div>
    </Modal>
  );
}

function CategoryBody({ category, items }: { category: CampusCategory; items: ScrapeItem[] }) {
  switch (category) {
    case 'news':
      return <NewsView items={items} />;
    case 'gym-hours':
      return <GymView items={items} />;
    case 'library':
      return <LibraryView items={items} />;
    case 'dining':
      return null;
  }
}

/* ------------------------------- shared UI ------------------------------- */

function SectionCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-4">
      {title ? <p className="mb-2 text-sm font-bold text-ink">{title}</p> : null}
      {children}
    </div>
  );
}

function HoursRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${last ? '' : 'border-b border-line-2'}`}>
      <span className="flex-1 pr-3 text-sm text-ink-2">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

/* --------------------------------- news --------------------------------- */

function NewsView({ items }: { items: ScrapeItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <a
          key={i}
          href={item.link ?? undefined}
          target={item.link ? '_blank' : undefined}
          rel={item.link ? 'noreferrer' : undefined}
          className={`block overflow-hidden rounded-2xl border border-line bg-cream no-underline ${
            item.link ? 'transition-colors hover:bg-cream-2 cursor-pointer' : 'cursor-default'
          }`}
        >
          {item.image ? (
            <img src={item.image} alt="" className="aspect-[3/2] w-full bg-cream-2 object-cover" />
          ) : null}
          <div className="p-4">
            <p className="text-base font-semibold leading-5 text-ink">{item.text}</p>
            {item.link ? <p className="mt-2 text-xs font-semibold text-sage">Read article →</p> : null}
          </div>
        </a>
      ))}
    </div>
  );
}

/* ---------------------------------- gym --------------------------------- */

// Matches "Monday-Thursday: 6:00 a.m. - 7:00 p.m." anywhere in a blob of text.
const TIME = '\\d{1,2}(?::\\d{2})?\\s*[ap]\\.?m\\.?';
const GYM_HOURS_RE = new RegExp(
  `([A-Za-z]+(?:\\s*[-–]\\s*[A-Za-z]+)?):\\s*(${TIME})\\s*(?:-|–|to)\\s*(${TIME})`,
  'gi',
);

interface ParsedHours {
  rows: { day: string; hours: string }[];
  about: string;
  hasClosure: boolean;
}

function parseGymHours(text: string): ParsedHours {
  const rows: ParsedHours['rows'] = [];
  let firstIndex = text.length;
  GYM_HOURS_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = GYM_HOURS_RE.exec(text))) {
    if (m.index < firstIndex) firstIndex = m.index;
    rows.push({
      day: m[1].replace(/\s*[-–]\s*/, '–').trim(),
      hours: `${m[2].trim()} – ${m[3].trim()}`,
    });
  }
  const about = (firstIndex < text.length ? text.slice(0, firstIndex) : text)
    .replace(/\b(?:Finals Week and )?(?:Summer )?Hours\s*$/i, '')
    .trim();
  return { rows, about, hasClosure: /\bCLOSED\b/i.test(text) };
}

function GymView({ items }: { items: ScrapeItem[] }) {
  const blob = items.map((i) => i.text).join('\n');
  const { rows, about, hasClosure } = parseGymHours(blob);

  return (
    <div className="flex flex-col gap-3">
      {rows.length > 0 ? (
        <SectionCard title="Hours">
          {rows.map((r, i) => (
            <HoursRow key={i} label={r.day} value={r.hours} last={i === rows.length - 1} />
          ))}
        </SectionCard>
      ) : null}

      {hasClosure ? (
        <div className="rounded-2xl border border-passenger-border bg-passenger-bg p-3.5">
          <p className="text-xs font-bold uppercase tracking-wider text-passenger">Scheduled closure</p>
          <p className="mt-1 text-xs leading-5 text-ink-2">
            A closure is noted in the details below — check before you go.
          </p>
        </div>
      ) : null}

      {about ? (
        <SectionCard title="About">
          <p className="text-sm leading-6 text-ink-2">{about}</p>
        </SectionCard>
      ) : null}

      {rows.length === 0 && !about ? (
        <SectionCard>
          <p className="text-sm leading-6 text-ink-2">{blob}</p>
        </SectionCard>
      ) : null}
    </div>
  );
}

/* -------------------------------- library ------------------------------- */

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const LIBRARY_RE = new RegExp(`^(.*?)\\s+(${WEEKDAYS.join('|')})\\s+(.*)$`, 'i');

interface LibraryGroup {
  location: string;
  link: string | null;
  rows: { day: string; hours: string }[];
}

function groupLibrary(items: ScrapeItem[]): LibraryGroup[] {
  const groups = new Map<string, LibraryGroup>();
  for (const item of items) {
    const m = item.text.match(LIBRARY_RE);
    const location = m ? m[1].trim() : item.text.trim();
    const group = groups.get(location) ?? { location, link: item.link, rows: [] };
    if (m) group.rows.push({ day: m[2], hours: m[3].trim() });
    if (!group.link && item.link) group.link = item.link;
    groups.set(location, group);
  }
  return [...groups.values()];
}

function LibraryView({ items }: { items: ScrapeItem[] }) {
  const groups = groupLibrary(items);
  return (
    <div className="flex flex-col gap-3">
      {groups.map((g, gi) => (
        <SectionCard key={gi} title={g.location}>
          {g.rows.length > 0 ? (
            g.rows.map((r, i) => (
              <HoursRow key={i} label={r.day} value={r.hours} last={i === g.rows.length - 1} />
            ))
          ) : (
            <p className="text-sm text-muted">Hours unavailable.</p>
          )}
          {g.link ? (
            <a
              href={g.link}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-xs font-semibold text-sage no-underline"
            >
              Visit library site →
            </a>
          ) : null}
        </SectionCard>
      ))}
    </div>
  );
}

/* -------------------------------- dining -------------------------------- */

// Café-hours feed comes back as one line per café, e.g. "The Caf Closed" or
// "Nordic Brew Tomorrow: Coffee Shop From 7:30 am to 11:00 am". Split the
// café name from its status, which always begins at one of these words.
const CAFE_STATUS_RE = /\b(Closed|Open|Today|Tomorrow|From)\b/;

function splitCafe(text: string): { name: string; status: string } {
  const m = text.match(CAFE_STATUS_RE);
  if (!m || m.index === undefined) return { name: text.trim(), status: '' };
  return { name: text.slice(0, m.index).trim(), status: text.slice(m.index).trim() };
}

// "07:30" → "7:30 am"; passes through anything that isn't a 24h time.
function formatTime(t: string): string {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return t;
  const h = Number(m[1]);
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m[2]} ${suffix}`;
}

function DietaryTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {tags.map((t, i) => (
        <span key={i} className="rounded-full bg-cream-2 px-2 py-0.5 text-[10px] font-medium text-ink-2">
          {t}
        </span>
      ))}
    </div>
  );
}

function DiningView({ data }: { data: DiningData }) {
  const { menu, hours } = data;
  return (
    <div className="flex flex-col gap-3">
      {hours.length > 0 ? (
        <SectionCard title="Café hours">
          {hours.map((item, i) => {
            const { name, status } = splitCafe(item.text);
            return <HoursRow key={i} label={name} value={status || '—'} last={i === hours.length - 1} />;
          })}
        </SectionCard>
      ) : null}

      {menu.map((dp, di) => (
        <SectionCard
          key={di}
          title={dp.start && dp.end ? `${dp.label} · ${formatTime(dp.start)} – ${formatTime(dp.end)}` : dp.label}
        >
          {dp.stations.map((st, si) => (
            <div key={si} className={si === 0 ? '' : 'mt-3'}>
              {st.name ? (
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">{st.name}</p>
              ) : null}
              {st.items.map((dish, ii) => (
                <div key={ii} className={`py-2.5 ${ii === st.items.length - 1 ? '' : 'border-b border-line-2'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex-1 text-sm text-ink-2">{dish.name}</span>
                    {dish.price ? <span className="text-sm font-semibold text-ink">${dish.price}</span> : null}
                  </div>
                  <DietaryTags tags={dish.dietary} />
                </div>
              ))}
            </div>
          ))}
        </SectionCard>
      ))}
    </div>
  );
}
