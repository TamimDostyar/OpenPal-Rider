import { api } from '@/api/client';
import type { FeedPostResponse } from '@/api/types';
import { useApiData } from '@/hooks/useApi';
import { formatDeparture, initialsOf } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Banner } from '@/components/ui/Banner';
import { EmptyState } from '@/components/ui/EmptyState';

interface UserProfileModalProps {
  username: string;
  onClose: () => void;
  onMessage: (username: string, name?: string | null) => void;
  onReport: (username: string) => void;
  onBlock: (username: string) => void;
  onOpenPost?: (post: FeedPostResponse) => void;
}

function PostRow({ post, onClick }: { post: FeedPostResponse; onClick?: () => void }) {
  const isPassenger = (post.postType ?? 'DRIVER') === 'PASSENGER';
  const dot = isPassenger ? 'bg-passenger' : 'bg-driver';
  const accent = isPassenger ? 'text-passenger' : 'text-driver';
  const tag = isPassenger ? 'Looking' : 'Offering';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="block w-full rounded-2xl border border-line bg-cream p-3.5 text-left transition-colors hover:bg-cream-2 disabled:cursor-default enabled:cursor-pointer"
    >
      <div className="mb-1 flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${accent}`}>{tag}</span>
      </div>
      <p className="truncate text-sm font-semibold text-ink">
        {post.origin} → {post.destination}
      </p>
      <p className="mt-0.5 truncate text-xs text-muted">
        {formatDeparture(post.departureTime)}
        {!isPassenger ? ` · $${Number(post.price).toFixed(0)} · ${post.seats} seat${post.seats === 1 ? '' : 's'}` : ''}
      </p>
    </button>
  );
}

export function UserProfileModal({
  username,
  onClose,
  onMessage,
  onReport,
  onBlock,
  onOpenPost,
}: UserProfileModalProps) {
  const { data: posts, loading: postsLoading, error: postsError } = useApiData(
    () => api.feed.listByUsername(username),
    [username],
  );
  const { data: ratings } = useApiData(() => api.ratings.forUser(username), [username]);

  const primary = posts?.[0];
  const displayName = primary?.name ?? username;
  const school = primary?.school ?? null;
  const driverVerified = !!primary?.driverVerified;
  const ratingAvg = ratings && ratings.count > 0 ? ratings.average.toFixed(1) : '—';
  const ratingCount = ratings?.count ?? 0;

  return (
    <Modal title={`@${username}`} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cream-2 to-line/60 text-2xl font-bold text-ink ring-1 ring-line">
            {initialsOf(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-bold text-ink">{displayName}</h3>
              {driverVerified ? (
                <span className="shrink-0 rounded-full bg-sage px-2 py-0.5 text-[10px] font-semibold text-white">
                  Vehicle on file
                </span>
              ) : null}
            </div>
            <p className="truncate text-xs text-muted">@{username}</p>
            {school ? <p className="mt-0.5 truncate text-xs text-muted">{school}</p> : null}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-line bg-cream-2 px-4 py-3">
          <Stat label="Posts" value={String(posts?.length ?? 0)} />
          <span className="h-8 w-px bg-line" />
          <Stat label="Rating" value={ratingAvg} />
          <span className="h-8 w-px bg-line" />
          <Stat label="Reviews" value={String(ratingCount)} />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onMessage(username, primary?.name)}
            className="flex-1 rounded-full bg-ink py-2.5 text-sm font-semibold text-cream shadow-[var(--shadow-xs)] transition-all hover:shadow-[var(--shadow-sm)] active:scale-95 cursor-pointer"
          >
            Message
          </button>
          <button
            type="button"
            onClick={() => onReport(username)}
            className="rounded-full border border-line px-4 py-2.5 text-xs font-semibold text-coral transition-colors hover:border-coral hover:bg-passenger-bg cursor-pointer"
          >
            Report
          </button>
          <button
            type="button"
            onClick={() => onBlock(username)}
            className="rounded-full border border-line px-4 py-2.5 text-xs font-semibold text-coral transition-colors hover:border-coral hover:bg-passenger-bg cursor-pointer"
          >
            Block
          </button>
        </div>

        <div className="flex flex-col gap-2 border-t border-line-2 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Their posts</p>
          {postsLoading ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton h-16 w-full rounded-2xl" />
              <div className="skeleton h-16 w-full rounded-2xl" />
            </div>
          ) : null}
          {postsError ? <Banner tone="error">{postsError}</Banner> : null}
          {!postsLoading && (posts?.length ?? 0) === 0 ? (
            <EmptyState title="No posts yet" />
          ) : (
            (posts ?? []).map((post) => (
              <PostRow key={post.id} post={post} onClick={onOpenPost ? () => onOpenPost(post) : undefined} />
            ))
          )}
        </div>

        {ratings && ratings.count > 0 ? (
          <div className="flex flex-col gap-2 border-t border-line-2 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Recent reviews</p>
            {ratings.ratings.slice(0, 5).map((r) => (
              <div key={r.id} className="rounded-2xl border border-line bg-cream p-3">
                <p className="text-xs text-muted">
                  @{r.raterUsername} · {'★'.repeat(r.stars)}
                </p>
                {r.text ? <p className="mt-0.5 text-sm text-ink-2">{r.text}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-lg font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted">{label}</p>
    </div>
  );
}
