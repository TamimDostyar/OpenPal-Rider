import { FeedPostCard } from '@/components/feed/FeedPostCard';
import { iconSearch, iconCampus } from '@/assets';
import { MOCK_POSTS } from '@/mock/data';

export function FeedTab() {
  const schoolDomain = 'uw';

  return (
    <div className="flex flex-col">
      <header className="flex items-end justify-between gap-3 px-5 pb-4 pt-2">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Rides</h1>
          <p className="mt-0.5 text-xs text-muted">@{schoolDomain}</p>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream"
        >
          <img src={iconSearch} alt="" aria-hidden className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-cream"
        >
          <span className="text-base">+</span>
          Post
        </button>
      </header>

      <div className="mx-5 mb-4 rounded-2xl border border-line bg-cream-2 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
            <img src={iconCampus} alt="" aria-hidden className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-sage">Campus today</p>
            <p className="mt-1 text-sm font-semibold text-ink">University of Washington</p>
            <p className="mt-2 text-xs leading-5 text-ink-2">
              Dining halls, events, and campus news — coming soon on web.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-5 pb-8">
        {MOCK_POSTS.map((post) => (
          <FeedPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
