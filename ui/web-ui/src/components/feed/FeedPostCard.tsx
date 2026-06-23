import type { MockPost } from '@/mock/data';

interface FeedPostCardProps {
  post: MockPost;
}

function formatDeparture(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function countdownTo(iso: string): { value: number; unit: string; label: string; past: boolean } | null {
  const target = new Date(iso).getTime();
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

function CountdownCircle({ iso, accent }: { iso: string; accent: boolean }) {
  const countdown = countdownTo(iso);
  if (!countdown) return null;

  const ring = countdown.past
    ? 'border-line-2'
    : accent
      ? 'border-passenger'
      : 'border-driver';
  const valueColor = countdown.past ? 'text-muted' : accent ? 'text-passenger' : 'text-driver';

  return (
    <div className="flex flex-col items-center">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${ring}`}>
        {countdown.past ? (
          <span className="text-[9px] font-semibold uppercase text-muted">past</span>
        ) : (
          <span className={`text-base font-bold ${valueColor}`}>
            {countdown.value}
            <span className="text-[10px] font-semibold">{countdown.unit}</span>
          </span>
        )}
      </div>
      <span className="mt-1 text-[10px] font-medium text-muted">{countdown.label}</span>
    </div>
  );
}

export function FeedPostCard({ post }: FeedPostCardProps) {
  const isPassenger = post.postType === 'PASSENGER';
  const soldOut = !isPassenger && post.seats <= 0;
  const accentText = isPassenger ? 'text-passenger' : 'text-driver';
  const accentDot = isPassenger ? 'bg-passenger' : 'bg-driver';
  const tagLabel = isPassenger ? 'Looking for a ride' : 'Offering a ride';
  const initial = (post.name?.[0] ?? '?').toUpperCase();

  return (
    <article className="rounded-2xl border border-line bg-cream p-4">
      <div className="mb-3 flex items-start gap-2">
        <div className="flex flex-1 items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${accentDot}`} />
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${accentText}`}>
            {tagLabel}
          </span>
          <span className="flex-1" />
          <span className="text-[11px] text-muted">{relativeTime(post.createdAt)}</span>
        </div>
        <CountdownCircle iso={post.departureTime} accent={isPassenger} />
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-ink" />
          <span className="flex-1 truncate text-base font-semibold text-ink">{post.origin}</span>
        </div>
        <div className="my-1 ml-[3px] h-3 w-px bg-line-2" />
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-ink" />
          <span className="flex-1 truncate text-base font-semibold text-ink">{post.destination}</span>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-[13px] text-ink-2">{formatDeparture(post.departureTime)}</span>
        {!isPassenger ? (
          <>
            <span className="h-1 w-1 rounded-full bg-line-2" />
            <span className="text-[13px] font-semibold text-ink">${post.price}</span>
            <span className="h-1 w-1 rounded-full bg-line-2" />
            <span className="text-[13px] text-ink-2">
              {post.seats} seat{post.seats === 1 ? '' : 's'}
              {soldOut ? ' · full' : ''}
            </span>
          </>
        ) : (
          <>
            <span className="h-1 w-1 rounded-full bg-line-2" />
            <span className="text-[13px] text-ink-2">
              {post.seats} rider{post.seats === 1 ? '' : 's'}
            </span>
          </>
        )}
      </div>

      {post.description ? (
        <p className="mb-3 line-clamp-3 text-[13px] leading-5 text-ink-2">{post.description}</p>
      ) : null}

      {!isPassenger && post.vehicleInfo ? (
        <p className="mb-3 truncate text-xs text-muted">{post.vehicleInfo}</p>
      ) : null}

      <div className="flex items-center gap-3 border-t border-line-2 pt-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-2">
            <span className="text-xs font-semibold text-ink">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[13px] font-semibold text-ink">{post.name}</span>
              {post.driverVerified ? (
                <span className="shrink-0 text-[10px] font-semibold text-sage">Vehicle on file</span>
              ) : null}
            </div>
            <span className="truncate text-[11px] text-muted">@{post.username}</span>
          </div>
        </div>

        <button type="button" className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink">
          Message
        </button>
        {!soldOut ? (
          <button type="button" className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-cream">
            {isPassenger ? 'Offer ride' : 'Book'}
          </button>
        ) : null}
        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-base text-muted">
          ⋯
        </button>
      </div>
    </article>
  );
}
