import type { FeedPostResponse } from '@/api/types';
import { formatDepartureLong } from '@/lib/format';
import { countdownLabel } from '@/lib/countdown';
import { Modal } from '@/components/ui/Modal';
import { PostRouteMap } from '@/components/map/PostRouteMap';

const DAY_LABELS: Record<string, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

function formatRecurring(raw: string): string {
  return raw
    .split(/[,\s]+/)
    .map((d) => DAY_LABELS[d.trim().toUpperCase()] ?? d.trim())
    .filter(Boolean)
    .join(' · ');
}

interface PostDetailModalProps {
  post: FeedPostResponse;
  isOwner: boolean;
  onClose: () => void;
  onBook?: (post: FeedPostResponse) => void;
  onMessage?: (post: FeedPostResponse) => void;
  onReport?: (post: FeedPostResponse) => void;
  onBlock?: (post: FeedPostResponse) => void;
  onEdit?: (post: FeedPostResponse) => void;
  onViewProfile?: (post: FeedPostResponse) => void;
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[46%] flex-1 rounded-2xl border border-line bg-cream p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

export function PostDetailModal({
  post,
  isOwner,
  onClose,
  onBook,
  onMessage,
  onReport,
  onBlock,
  onEdit,
  onViewProfile,
}: PostDetailModalProps) {
  const isPassenger = post.postType === 'PASSENGER';
  const soldOut = !isPassenger && post.seats <= 0;
  const accentText = isPassenger ? 'text-passenger' : 'text-driver';
  const accentBg = isPassenger ? 'bg-passenger-bg' : 'bg-driver-bg';
  const accentBorder = isPassenger ? 'border-passenger-border' : 'border-driver-border';
  const tagLabel = isPassenger ? 'Looking for a ride' : 'Offering a ride';

  const displayName = post.name || post.username;
  const initial = (displayName?.[0] ?? '?').toUpperCase();
  const countdown = countdownLabel(post.departureTime);

  return (
    <Modal title="Ride details" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {isOwner ? (
          <button
            type="button"
            onClick={() => onEdit?.(post)}
            className="self-end text-sm font-semibold text-ink underline cursor-pointer"
          >
            Edit post
          </button>
        ) : null}

        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 ${accentBg} ${accentBorder}`}>
          <span className={`text-xs font-semibold uppercase tracking-wider ${accentText}`}>{tagLabel}</span>
          <span className="flex-1" />
          {countdown ? <span className={`text-xs font-bold ${accentText}`}>{countdown}</span> : null}
        </div>

        <div className="rounded-2xl border border-line bg-cream p-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-driver" />
            <span className="flex-1 text-lg font-semibold text-ink">{post.origin}</span>
          </div>
          <div className="my-1.5 ml-[4px] h-5 w-px bg-line-2" />
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-coral" />
            <span className="flex-1 text-lg font-semibold text-ink">{post.destination}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Route</p>
          <PostRouteMap
            originLat={post.originLat}
            originLng={post.originLng}
            destLat={post.destLat}
            destLng={post.destLng}
            originLabel={post.origin}
            destLabel={post.destination}
            height={240}
          />
          <div className="flex items-center gap-4 px-1">
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2.5 w-2.5 rounded-full bg-driver" /> Start
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2.5 w-2.5 rounded-full bg-coral" /> Destination
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <FactCard label="Departure" value={formatDepartureLong(post.departureTime)} />
          {!isPassenger ? <FactCard label="Price" value={`$${Number(post.price).toFixed(0)}`} /> : null}
          <FactCard
            label={isPassenger ? 'Riders' : 'Seats'}
            value={`${post.seats} ${isPassenger ? (post.seats === 1 ? 'rider' : 'riders') : post.seats === 1 ? 'seat' : 'seats'}${soldOut ? ' · full' : ''}`}
          />
          {post.recurringDays ? <FactCard label="Repeats" value={formatRecurring(post.recurringDays)} /> : null}
        </div>

        {post.description ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Notes</p>
            <p className="text-sm leading-6 text-ink-2">{post.description}</p>
          </div>
        ) : null}

        {!isPassenger && post.vehicleInfo ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Vehicle</p>
            <p className="text-sm text-ink-2">{post.vehicleInfo}</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => onViewProfile?.(post)}
          disabled={!onViewProfile}
          className="flex items-center gap-3 rounded-2xl border border-line bg-cream p-4 text-left transition-colors hover:bg-cream-2 disabled:cursor-default enabled:cursor-pointer"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cream-2 to-line/60 ring-1 ring-line">
            <span className="text-base font-bold text-ink">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-ink">{displayName}</span>
              {post.driverVerified ? (
                <span className="shrink-0 text-[11px] font-semibold text-sage">Vehicle on file</span>
              ) : null}
            </div>
            <span className="truncate text-xs text-muted">
              @{post.username}
              {post.school ? ` · ${post.school}` : ''}
            </span>
          </div>
          {onViewProfile ? <span className="text-muted">›</span> : null}
        </button>

        {!isOwner ? (
          <div className="sticky bottom-0 -mx-5 -mb-5 mt-2 flex items-center gap-3 border-t border-line bg-cream px-5 py-4">
            <button
              type="button"
              onClick={() => onReport?.(post)}
              className="px-2 py-2 text-sm text-muted transition-colors hover:text-ink cursor-pointer"
            >
              Report
            </button>
            <button
              type="button"
              onClick={() => onBlock?.(post)}
              className="px-2 py-2 text-sm text-muted transition-colors hover:text-ink cursor-pointer"
            >
              Block
            </button>
            <span className="flex-1" />
            <button
              type="button"
              onClick={() => onMessage?.(post)}
              className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink cursor-pointer"
            >
              Message
            </button>
            {!soldOut ? (
              <button
                type="button"
                onClick={() => onBook?.(post)}
                className="min-w-[88px] rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream shadow-[var(--shadow-xs)] transition-all hover:shadow-[var(--shadow-sm)] active:scale-95 cursor-pointer"
              >
                {isPassenger ? 'Offer ride' : 'Book'}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
