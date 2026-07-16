import { useState } from 'react';
import { api } from '@/api/client';
import type { FeedPostResponse, MyProfile } from '@/api/types';
import { errorMessage, useApiData } from '@/hooks/useApi';
import { iconSearch, iconCampus } from '@/assets';
import { FeedPostCard } from '@/components/feed/FeedPostCard';
import { CreatePostModal } from '@/components/feed/CreatePostModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Textarea } from '@/components/ui/Textarea';
import { Banner } from '@/components/ui/Banner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';

interface FeedTabProps {
  me: MyProfile | null;
  onOpenChat: (username: string) => void;
}

interface SearchState {
  destination: string;
  maxPrice: string;
  minSeats: string;
}

const EMPTY_SEARCH: SearchState = { destination: '', maxPrice: '', minSeats: '' };

export function FeedTab({ me, onOpenChat }: FeedTabProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState<SearchState>(EMPTY_SEARCH);
  const [activeSearch, setActiveSearch] = useState<SearchState | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [bookTarget, setBookTarget] = useState<FeedPostResponse | null>(null);
  const [reportTarget, setReportTarget] = useState<FeedPostResponse | null>(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  const {
    data: posts,
    loading,
    error,
    reload,
  } = useApiData(() => {
    if (activeSearch) {
      return api.feed.search({
        destination: activeSearch.destination || undefined,
        maxPrice: activeSearch.maxPrice ? Number(activeSearch.maxPrice) : undefined,
        minSeats: activeSearch.minSeats ? Number(activeSearch.minSeats) : undefined,
      });
    }
    return api.feed.list();
  }, [activeSearch]);

  const { data: announcements } = useApiData(() => api.announcements());
  const latestAnnouncement = announcements?.success?.find((a) => a.announcement)?.announcement;

  const flash = (message: string) => {
    setNotice(message);
    setActionError('');
    window.setTimeout(() => setNotice(''), 4000);
  };

  const fail = (err: unknown) => {
    setActionError(errorMessage(err));
    window.setTimeout(() => setActionError(''), 6000);
  };

  const handleDelete = async (post: FeedPostResponse) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.feed.delete(post.id);
      flash('Post deleted.');
      void reload();
    } catch (err) {
      fail(err);
    }
  };

  const handleBlock = async (post: FeedPostResponse) => {
    if (!window.confirm(`Block @${post.username}? You won't see their posts or messages.`)) return;
    try {
      await api.blocks.create({ username: post.username });
      flash(`Blocked @${post.username}.`);
      void reload();
    } catch (err) {
      fail(err);
    }
  };

  return (
    <div className="flex flex-col">
      <header className="flex items-end justify-between gap-3 px-5 pb-5 pt-4">
        <div className="flex-1">
          <h1 className="text-[1.75rem] font-bold tracking-tight text-ink sm:text-3xl">Rides</h1>
          {me?.school ? <p className="mt-0.5 text-xs text-muted">{me.school}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Search rides"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-150 ease-out active:scale-95 cursor-pointer ${
            searchOpen || activeSearch
              ? 'border-ink bg-ink shadow-[var(--shadow-sm)]'
              : 'border-line bg-cream hover:border-ink'
          }`}
        >
          <img
            src={iconSearch}
            alt=""
            aria-hidden
            className={`h-5 w-5 ${searchOpen || activeSearch ? 'invert' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-cream shadow-[var(--shadow-sm)] transition-all duration-150 ease-out hover:shadow-[var(--shadow-md)] active:scale-95 cursor-pointer"
        >
          <span className="text-base leading-none">+</span>
          Post
        </button>
      </header>

      {searchOpen ? (
        <form
          className="animate-fade-up mx-5 mb-4 flex flex-col gap-3 rounded-3xl border border-line bg-cream-2 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setActiveSearch({ ...search });
          }}
        >
          <TextField
            label="Destination"
            placeholder="Where to?"
            value={search.destination}
            onChange={(e) => setSearch({ ...search, destination: e.target.value })}
          />
          <div className="flex gap-3">
            <TextField
              label="Max price ($)"
              type="number"
              min={0}
              placeholder="Any"
              value={search.maxPrice}
              onChange={(e) => setSearch({ ...search, maxPrice: e.target.value })}
            />
            <TextField
              label="Min seats"
              type="number"
              min={1}
              placeholder="Any"
              value={search.minSeats}
              onChange={(e) => setSearch({ ...search, minSeats: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" fullWidth={false} className="flex-1">
              Search
            </Button>
            {activeSearch ? (
              <Button
                variant="outline"
                fullWidth={false}
                className="flex-1"
                onClick={() => {
                  setSearch(EMPTY_SEARCH);
                  setActiveSearch(null);
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </form>
      ) : null}

      <div className="mx-5 mb-5 rounded-3xl border border-line bg-gradient-to-br from-cream-2 to-cream p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream shadow-[var(--shadow-xs)]">
            <img src={iconCampus} alt="" aria-hidden className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-sage">Campus today</p>
            <p className="mt-1 text-sm font-semibold text-ink">{me?.school ?? 'Your campus'}</p>
            <p className="mt-2 text-xs leading-5 text-ink-2">
              {latestAnnouncement ?? 'No announcements right now — check back later.'}
            </p>
          </div>
        </div>
      </div>

      {notice ? (
        <div className="mx-5 mb-3">
          <Banner tone="success">{notice}</Banner>
        </div>
      ) : null}
      {actionError ? (
        <div className="mx-5 mb-3">
          <Banner tone="error">{actionError}</Banner>
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5 px-5 pb-8">
        {loading ? <ListSkeleton /> : null}
        {error ? (
          <EmptyState title="Couldn't load rides" body={error} />
        ) : null}
        {!loading && !error && (posts?.length ?? 0) === 0 ? (
          <EmptyState
            icon={iconCampus}
            title={activeSearch ? 'No rides match your search' : 'No rides yet'}
            body={
              activeSearch
                ? 'Try widening your price or seat filters.'
                : 'Be the first to post a ride on your campus.'
            }
            action={
              !activeSearch ? (
                <Button fullWidth={false} className="mt-1 px-6" onClick={() => setCreateOpen(true)}>
                  Post a ride
                </Button>
              ) : undefined
            }
          />
        ) : null}
        {(posts ?? []).map((post, i) => (
          <div key={post.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
            <FeedPostCard
              post={post}
              isOwn={me?.username === post.username}
              onBook={(p) => setBookTarget(p)}
              onMessage={(p) => onOpenChat(p.username)}
              onDelete={handleDelete}
              onReport={(p) => setReportTarget(p)}
              onBlock={handleBlock}
            />
          </div>
        ))}
      </div>

      {createOpen ? (
        <CreatePostModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            flash('Your ride is posted.');
            void reload();
          }}
        />
      ) : null}

      {bookTarget ? (
        <BookModal
          post={bookTarget}
          onClose={() => setBookTarget(null)}
          onBooked={() => {
            flash('Request sent! Track it in Bookings.');
            void reload();
          }}
        />
      ) : null}

      {reportTarget ? (
        <ReportModal
          post={reportTarget}
          onClose={() => setReportTarget(null)}
          onReported={() => flash('Report submitted. Our team will review it.')}
        />
      ) : null}
    </div>
  );
}

function BookModal({
  post,
  onClose,
  onBooked,
}: {
  post: FeedPostResponse;
  onClose: () => void;
  onBooked: () => void;
}) {
  const [seats, setSeats] = useState('1');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isPassenger = post.postType === 'PASSENGER';

  const handleBook = async () => {
    const seatsNum = Number(seats);
    if (!Number.isInteger(seatsNum) || seatsNum < 1) {
      setError('Seats must be a whole number of at least 1.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.bookings.request({ postId: post.id, seatsRequested: seatsNum });
      onBooked();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal title={isPassenger ? 'Offer this ride' : 'Book this ride'} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl bg-cream-2 p-4">
          <p className="text-sm font-semibold text-ink">{post.origin}</p>
          <p className="text-sm text-muted">→ {post.destination}</p>
          {!isPassenger ? (
            <p className="mt-2 text-xs text-ink-2">
              ${post.price} per seat · {post.seats} available
            </p>
          ) : null}
        </div>
        <TextField
          label="Seats"
          type="number"
          min={1}
          max={Math.max(1, post.seats)}
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
        />
        {error ? <Banner tone="error">{error}</Banner> : null}
        <Button onClick={handleBook} size="lg" loading={busy}>
          {busy ? 'Sending…' : 'Send request'}
        </Button>
      </div>
    </Modal>
  );
}

function ReportModal({
  post,
  onClose,
  onReported,
}: {
  post: FeedPostResponse;
  onClose: () => void;
  onReported: () => void;
}) {
  const [reason, setReason] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleReport = async () => {
    if (!reason.trim()) {
      setError('Please give a reason.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.reports.create({
        targetType: 'POST',
        targetPostId: post.id,
        reason: reason.trim(),
        text: text.trim() || undefined,
      });
      onReported();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal title="Report post" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-ink-2">
          Reporting <span className="font-semibold">@{post.username}</span>&apos;s post from{' '}
          {post.origin} to {post.destination}.
        </p>
        <TextField
          label="Reason"
          placeholder="e.g. spam, unsafe behavior"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Textarea label="Details (optional)" value={text} onChange={(e) => setText(e.target.value)} rows={3} />
        {error ? <Banner tone="error">{error}</Banner> : null}
        <Button variant="coral" size="lg" onClick={handleReport} loading={busy}>
          {busy ? 'Submitting…' : 'Submit report'}
        </Button>
      </div>
    </Modal>
  );
}
