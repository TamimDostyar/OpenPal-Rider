import { useMemo, useState } from 'react';
import { api } from '@/api/client';
import type { FeedPostResponse, MyProfile } from '@/api/types';
import { errorMessage, useApiData } from '@/hooks/useApi';
import { parseLocalDateTime } from '@/lib/datetime';
import { iconSearch } from '@/assets';
import { FeedPostCard } from '@/components/feed/FeedPostCard';
import { CreatePostModal } from '@/components/feed/CreatePostModal';
import { PostDetailModal } from '@/components/feed/PostDetailModal';
import { UserProfileModal } from '@/components/profile/UserProfileModal';
import { CampusToday } from '@/components/campus/CampusToday';
import type { CampusUtil } from '@/components/campus/campusUtils';
import { CampusUtilityModal } from '@/components/campus/CampusUtilityModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Textarea } from '@/components/ui/Textarea';
import { Banner } from '@/components/ui/Banner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';

interface FeedTabProps {
  me: MyProfile | null;
  onOpenChat: (username: string, name?: string | null) => void;
}

interface SearchState {
  destination: string;
  dateFrom: string;
  dateTo: string;
  maxPrice: string;
  minSeats: string;
}

const EMPTY_SEARCH: SearchState = { destination: '', dateFrom: '', dateTo: '', maxPrice: '', minSeats: '' };

type FeedScope = 'all' | 'offering' | 'looking';
type ReportTarget = { kind: 'post'; post: FeedPostResponse } | { kind: 'user'; username: string };

const ACTIVE_BOOKING_STATES = new Set(['REQUESTED', 'ACCEPTED', 'COMPLETED']);

export function FeedTab({ me, onOpenChat }: FeedTabProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState<SearchState>(EMPTY_SEARCH);
  const [activeSearch, setActiveSearch] = useState<SearchState | null>(null);
  const [feedScope, setFeedScope] = useState<FeedScope>('all');
  const [announcementExpanded, setAnnouncementExpanded] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FeedPostResponse | null>(null);
  const [detailTarget, setDetailTarget] = useState<FeedPostResponse | null>(null);
  const [bookTarget, setBookTarget] = useState<FeedPostResponse | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [campusUtil, setCampusUtil] = useState<CampusUtil | null>(null);

  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  const {
    data: rawPosts,
    loading,
    error,
    reload,
  } = useApiData(() => {
    if (activeSearch) {
      return api.feed.search({
        destination: activeSearch.destination || undefined,
        dateFrom: activeSearch.dateFrom || undefined,
        dateTo: activeSearch.dateTo || undefined,
        maxPrice: activeSearch.maxPrice ? Number(activeSearch.maxPrice) : undefined,
        minSeats: activeSearch.minSeats ? Number(activeSearch.minSeats) : undefined,
      });
    }
    return api.feed.list();
  }, [activeSearch]);

  const { data: myBookings } = useApiData(() => api.bookings.mine());
  const { data: announcements } = useApiData(() => api.announcements());
  const latestAnnouncement = announcements?.success?.find((a) => a.announcement)?.announcement ?? null;

  const { data: newsCheck } = useApiData(
    () => (me?.school ? api.schools.byCategory(me.school, 'news') : Promise.resolve(null)),
    [me?.school],
  );
  const hasData = (newsCheck?.length ?? 0) > 0;

  // Departed rides and rides already actively booked by me are noise, not signal.
  const bookedPostIds = useMemo(
    () => new Set((myBookings ?? []).filter((b) => ACTIVE_BOOKING_STATES.has(b.status)).map((b) => b.postId)),
    [myBookings],
  );

  const posts = useMemo(() => {
    // Filtering out already-departed rides is a one-way, monotonic cutoff —
    // reading the clock here can't produce a visible inconsistency.
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    return (rawPosts ?? [])
      .filter((post) => {
        if (bookedPostIds.has(post.id) && post.username !== me?.username) return false;
        return parseLocalDateTime(post.departureTime).getTime() >= now || post.username === me?.username;
      })
      .sort((a, b) => parseLocalDateTime(a.departureTime).getTime() - parseLocalDateTime(b.departureTime).getTime());
  }, [rawPosts, bookedPostIds, me?.username]);

  const offeringCount = posts.filter((p) => p.postType !== 'PASSENGER').length;
  const lookingCount = posts.filter((p) => p.postType === 'PASSENGER').length;
  const visiblePosts = posts.filter((post) => {
    if (feedScope === 'offering') return post.postType !== 'PASSENGER';
    if (feedScope === 'looking') return post.postType === 'PASSENGER';
    return true;
  });

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
      setDetailTarget(null);
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
      setDetailTarget(null);
      setProfileUsername(null);
      void reload();
    } catch (err) {
      fail(err);
    }
  };

  const handleBlockUsername = async (username: string) => {
    if (!window.confirm(`Block @${username}? You won't see their posts or messages.`)) return;
    try {
      await api.blocks.create({ username });
      flash(`Blocked @${username}.`);
      setProfileUsername(null);
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
            label="Destination contains"
            placeholder="Where to?"
            value={search.destination}
            onChange={(e) => setSearch({ ...search, destination: e.target.value })}
          />
          <div className="flex gap-3">
            <TextField
              label="Earliest departure"
              type="datetime-local"
              value={search.dateFrom}
              onChange={(e) => setSearch({ ...search, dateFrom: e.target.value })}
            />
            <TextField
              label="Latest departure"
              type="datetime-local"
              value={search.dateTo}
              onChange={(e) => setSearch({ ...search, dateTo: e.target.value })}
            />
          </div>
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

      {latestAnnouncement ? (
        <div className="mx-5 mb-4 rounded-2xl border border-line bg-cream px-4 py-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-coral-dk">Announcement</p>
            {announcementExpanded ? (
              <p className="text-sm leading-5 text-ink">{latestAnnouncement}</p>
            ) : null}
            <button
              type="button"
              onClick={() => setAnnouncementExpanded((v) => !v)}
              className="rounded-full border border-coral-dk bg-cream-2 px-3 py-1 text-[11px] font-semibold text-coral-dk transition-colors hover:bg-passenger-bg cursor-pointer"
            >
              {announcementExpanded ? 'Hide' : 'Read'}
            </button>
          </div>
        </div>
      ) : null}

      {!activeSearch ? (
        <CampusToday school={me?.school ?? null} hasData={hasData} onOpen={setCampusUtil} />
      ) : null}

      <div className="mx-5 mb-4 grid grid-cols-3 gap-1 rounded-2xl border border-line bg-cream-2 p-1">
        {(
          [
            { key: 'all', label: 'All', count: posts.length },
            { key: 'offering', label: 'Offering', count: offeringCount },
            { key: 'looking', label: 'Looking', count: lookingCount },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFeedScope(tab.key)}
            className={`rounded-xl py-2 text-xs font-semibold cursor-pointer transition-all duration-150 ease-out ${
              feedScope === tab.key ? 'bg-cream text-ink shadow-[var(--shadow-sm)]' : 'text-muted hover:text-ink'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
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
        {error ? <EmptyState title="Couldn't load rides" body={error} /> : null}
        {!loading && !error && visiblePosts.length === 0 ? (
          <EmptyState
            title={
              activeSearch
                ? 'No rides match your search'
                : feedScope === 'offering'
                  ? 'No offering rides yet'
                  : feedScope === 'looking'
                    ? 'No ride requests yet'
                    : 'No rides yet'
            }
            body={
              activeSearch
                ? 'Try widening your filters.'
                : feedScope !== 'all'
                  ? 'Switch to all posts, or create one yourself.'
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
        {visiblePosts.map((post, i) => (
          <div key={post.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
            <FeedPostCard
              post={post}
              isOwn={me?.username === post.username}
              onOpen={(p) => setDetailTarget(p)}
              onViewProfile={(p) => setProfileUsername(p.username)}
              onBook={(p) => setBookTarget(p)}
              onMessage={(p) => onOpenChat(p.username, p.name)}
              onDelete={handleDelete}
              onReport={(p) => setReportTarget({ kind: 'post', post: p })}
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

      {editTarget ? (
        <CreatePostModal
          editingPost={editTarget}
          onClose={() => setEditTarget(null)}
          onCreated={() => {
            flash('Post updated.');
            setDetailTarget(null);
            void reload();
          }}
        />
      ) : null}

      {detailTarget ? (
        <PostDetailModal
          post={detailTarget}
          isOwner={me?.username === detailTarget.username}
          onClose={() => setDetailTarget(null)}
          onBook={(p) => {
            setDetailTarget(null);
            setBookTarget(p);
          }}
          onMessage={(p) => {
            setDetailTarget(null);
            onOpenChat(p.username, p.name);
          }}
          onReport={(p) => {
            setDetailTarget(null);
            setReportTarget({ kind: 'post', post: p });
          }}
          onBlock={handleBlock}
          onEdit={(p) => {
            setDetailTarget(null);
            setEditTarget(p);
          }}
          onViewProfile={(p) => setProfileUsername(p.username)}
        />
      ) : null}

      {profileUsername ? (
        <UserProfileModal
          username={profileUsername}
          onClose={() => setProfileUsername(null)}
          onMessage={(username, name) => {
            setProfileUsername(null);
            onOpenChat(username, name);
          }}
          onReport={(username) => {
            setProfileUsername(null);
            setReportTarget({ kind: 'user', username });
          }}
          onBlock={handleBlockUsername}
          onOpenPost={(p) => {
            setProfileUsername(null);
            setDetailTarget(p);
          }}
        />
      ) : null}

      {campusUtil ? (
        <CampusUtilityModal
          category={campusUtil.category}
          title={campusUtil.label}
          subtitle={campusUtil.subtitle}
          school={me?.school ?? ''}
          onClose={() => setCampusUtil(null)}
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
          target={reportTarget}
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
  target,
  onClose,
  onReported,
}: {
  target: ReportTarget;
  onClose: () => void;
  onReported: () => void;
}) {
  const [reason, setReason] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const username = target.kind === 'post' ? target.post.username : target.username;

  const handleReport = async () => {
    if (!reason.trim()) {
      setError('Please give a reason.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.reports.create({
        targetType: target.kind === 'post' ? 'POST' : 'USER',
        targetUsername: target.kind === 'user' ? target.username : undefined,
        targetPostId: target.kind === 'post' ? target.post.id : undefined,
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
    <Modal title={target.kind === 'post' ? 'Report post' : 'Report user'} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-ink-2">
          Reporting <span className="font-semibold">@{username}</span>
          {target.kind === 'post' ? (
            <>
              &apos;s post from {target.post.origin} to {target.post.destination}
            </>
          ) : null}
          .
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
