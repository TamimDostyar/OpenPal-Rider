import { useEffect, useRef, useState } from 'react';
import type { FeedPostResponse } from '@/api/types';
import { formatDeparture, relativeTime } from '@/lib/format';
import { countdownTo } from '@/lib/countdown';

interface FeedPostCardProps {
  post: FeedPostResponse;
  isOwn?: boolean;
  onOpen?: (post: FeedPostResponse) => void;
  onViewProfile?: (post: FeedPostResponse) => void;
  onBook?: (post: FeedPostResponse) => void;
  onMessage?: (post: FeedPostResponse) => void;
  onDelete?: (post: FeedPostResponse) => void;
  onReport?: (post: FeedPostResponse) => void;
  onBlock?: (post: FeedPostResponse) => void;
}

function CountdownCircle({ iso, accent }: { iso: string; accent: boolean }) {
  const countdown = countdownTo(iso);
  if (!countdown) return null;

  const ring = countdown.past ? 'border-line-2' : accent ? 'border-passenger' : 'border-driver';
  const valueColor = countdown.past ? 'text-muted' : accent ? 'text-passenger' : 'text-driver';

  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 bg-cream ${ring}`}>
        {countdown.past ? (
          <span className="text-[9px] font-semibold uppercase text-muted">past</span>
        ) : (
          <span className={`text-base font-bold leading-none ${valueColor}`}>
            {countdown.value}
            <span className="text-[10px] font-semibold">{countdown.unit}</span>
          </span>
        )}
      </div>
      <span className="mt-1 text-[10px] font-medium text-muted">{countdown.label}</span>
    </div>
  );
}

export function FeedPostCard({
  post,
  isOwn,
  onOpen,
  onViewProfile,
  onBook,
  onMessage,
  onDelete,
  onReport,
  onBlock,
}: FeedPostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const isPassenger = post.postType === 'PASSENGER';
  const soldOut = !isPassenger && post.seats <= 0;
  const accentText = isPassenger ? 'text-passenger' : 'text-driver';
  const accentBg = isPassenger ? 'bg-passenger-bg' : 'bg-driver-bg';
  const tagLabel = isPassenger ? 'Looking for a ride' : 'Offering a ride';
  const displayName = post.name || post.username;
  const initial = (displayName?.[0] ?? '?').toUpperCase();

  return (
    <article className="group rounded-3xl border border-line bg-cream p-5 shadow-[var(--shadow-xs)] transition-shadow duration-200 ease-out hover:shadow-[var(--shadow-md)]">
      <div
        role={onOpen ? 'button' : undefined}
        tabIndex={onOpen ? 0 : undefined}
        onClick={() => onOpen?.(post)}
        onKeyDown={(e) => {
          if (onOpen && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onOpen(post);
          }
        }}
        className={onOpen ? 'cursor-pointer' : ''}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${accentBg} ${accentText}`}
            >
              {tagLabel}
            </span>
            {isOwn ? (
              <span className="rounded-full bg-cream-2 px-2.5 py-1 text-[11px] font-semibold text-muted">
                Your post
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[11px] text-muted">{relativeTime(post.createdAt)}</span>
            <CountdownCircle iso={post.departureTime} accent={isPassenger} />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink bg-cream" />
            <span className="min-w-0 flex-1 truncate text-[17px] font-semibold text-ink">{post.origin}</span>
          </div>
          <div className="my-1 ml-[4.5px] h-4 w-px border-l-2 border-dotted border-line-2" />
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-ink" />
            <span className="min-w-0 flex-1 truncate text-[17px] font-semibold text-ink">{post.destination}</span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-[13px] font-medium text-ink-2">{formatDeparture(post.departureTime)}</span>
          {!isPassenger ? (
            <>
              <span className="h-1 w-1 rounded-full bg-line-2" />
              <span className="text-[13px] font-bold text-ink">${post.price}</span>
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
          <p className="mb-4 line-clamp-3 text-[13px] leading-5 text-ink-2">{post.description}</p>
        ) : null}

        {!isPassenger && post.vehicleInfo ? (
          <p className="mb-4 truncate text-xs text-muted">{post.vehicleInfo}</p>
        ) : null}
      </div>

      <div className="relative flex items-center gap-3 border-t border-line-2 pt-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile?.(post);
          }}
          disabled={!onViewProfile}
          className="flex flex-1 items-center gap-3 border-0 bg-transparent p-0 text-left disabled:cursor-default enabled:cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cream-2 to-line/60 ring-1 ring-line">
            <span className="text-xs font-bold text-ink">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[13px] font-semibold text-ink">{displayName}</span>
              {post.driverVerified ? (
                <span className="shrink-0 text-[10px] font-semibold text-sage">Vehicle on file</span>
              ) : null}
            </div>
            <span className="truncate text-[11px] text-muted">
              @{post.username}
              {onViewProfile ? ' ›' : ''}
            </span>
          </div>
        </button>

        {!isOwn ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMessage?.(post);
            }}
            className="rounded-full border border-line px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink cursor-pointer"
          >
            Message
          </button>
        ) : null}
        {!isOwn && !soldOut ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBook?.(post);
            }}
            className="rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-cream shadow-[var(--shadow-xs)] transition-all duration-150 hover:shadow-[var(--shadow-sm)] active:scale-95 cursor-pointer"
          >
            {isPassenger ? 'Offer ride' : 'Book'}
          </button>
        ) : null}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          aria-label="More options"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base text-muted transition-colors hover:bg-cream-2 hover:text-ink cursor-pointer"
        >
          ⋯
        </button>

        {menuOpen ? (
          <div
            ref={menuRef}
            className="animate-scale-in absolute bottom-11 right-0 z-10 w-48 origin-bottom-right overflow-hidden rounded-2xl border border-line bg-cream shadow-[var(--shadow-lg)]"
          >
            {isOwn ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete?.(post);
                }}
                className="block w-full px-4 py-3 text-left text-sm font-semibold text-coral transition-colors hover:bg-passenger-bg cursor-pointer"
              >
                Delete post
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onReport?.(post);
                  }}
                  className="block w-full border-b border-line-2 px-4 py-3 text-left text-sm font-medium text-ink transition-colors hover:bg-cream-2 cursor-pointer"
                >
                  Report post
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onBlock?.(post);
                  }}
                  className="block w-full px-4 py-3 text-left text-sm font-medium text-coral transition-colors hover:bg-passenger-bg cursor-pointer"
                >
                  Block @{post.username}
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
