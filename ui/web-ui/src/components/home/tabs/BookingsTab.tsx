import { useState } from 'react';
import { api } from '@/api/client';
import type { BookingResponse, BookingStatus, MyProfile } from '@/api/types';
import { errorMessage, useApiData } from '@/hooks/useApi';
import { formatDeparture } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Banner } from '@/components/ui/Banner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { tabBookings } from '@/assets';

const STATUS_LABEL: Record<BookingStatus, string> = {
  REQUESTED: 'Requested',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

const STATUS_TONE: Record<BookingStatus, string> = {
  REQUESTED: 'bg-[rgba(194,65,12,0.1)] text-sun',
  ACCEPTED: 'bg-driver-bg text-driver',
  DECLINED: 'bg-cream-2 text-muted',
  CANCELLED: 'bg-cream-2 text-muted',
  COMPLETED: 'bg-[rgba(71,85,105,0.1)] text-sky',
};

type ListKind = 'mine' | 'incoming';

interface BookingsTabProps {
  me: MyProfile | null;
  onOpenChat: (username: string, name?: string | null) => void;
}

export function BookingsTab({ me, onOpenChat }: BookingsTabProps) {
  const [kind, setKind] = useState<ListKind>('mine');
  const [rateTarget, setRateTarget] = useState<BookingResponse | null>(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  const {
    data: bookings,
    loading,
    error,
    reload,
  } = useApiData(() => (kind === 'mine' ? api.bookings.mine() : api.bookings.incoming()), [kind]);

  const flash = (message: string) => {
    setNotice(message);
    setActionError('');
    window.setTimeout(() => setNotice(''), 4000);
  };

  const runAction = async (action: () => Promise<unknown>, doneMessage: string) => {
    try {
      await action();
      flash(doneMessage);
      void reload();
    } catch (err) {
      setActionError(errorMessage(err));
      window.setTimeout(() => setActionError(''), 6000);
    }
  };

  const otherUsername = (booking: BookingResponse): string =>
    booking.riderUsername === me?.username ? booking.driverUsername : booking.riderUsername;

  return (
    <div className="flex flex-col">
      <header className="px-5 pb-5 pt-4">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-ink sm:text-3xl">Bookings</h1>
        <p className="mt-1 text-sm text-muted">Track ride requests and offers</p>
      </header>

      <div className="mx-5 mb-5 grid grid-cols-2 gap-1 rounded-2xl border border-line bg-cream-2 p-1">
        <button
          type="button"
          onClick={() => setKind('mine')}
          className={`rounded-xl py-2.5 text-xs font-semibold cursor-pointer transition-all duration-150 ease-out ${
            kind === 'mine' ? 'bg-cream text-ink shadow-[var(--shadow-sm)]' : 'text-muted hover:text-ink'
          }`}
        >
          My requests
        </button>
        <button
          type="button"
          onClick={() => setKind('incoming')}
          className={`rounded-xl py-2.5 text-xs font-semibold cursor-pointer transition-all duration-150 ease-out ${
            kind === 'incoming' ? 'bg-cream text-ink shadow-[var(--shadow-sm)]' : 'text-muted hover:text-ink'
          }`}
        >
          Incoming
        </button>
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

      <div className="flex flex-col gap-3 px-5 pb-8">
        {loading ? <ListSkeleton lines={2} /> : null}
        {error ? <EmptyState title="Couldn't load bookings" body={error} /> : null}
        {!loading && !error && (bookings?.length ?? 0) === 0 ? (
          <EmptyState
            icon={tabBookings}
            title={kind === 'mine' ? 'No requests yet' : 'No incoming requests'}
            body={
              kind === 'mine'
                ? 'Book a ride from the feed and it will show up here.'
                : 'Requests on your posts will show up here.'
            }
          />
        ) : null}

        {(bookings ?? []).map((booking, i) => {
          const other = otherUsername(booking);
          // Who decides an offer depends on who initiated it, not on the tab
          // being viewed:
          //  - DRIVER post  → rider initiated (booking request), driver decides.
          //  - PASSENGER post → driver initiated (ride offer), rider decides.
          const passengerPost = booking.postType === 'PASSENGER';
          const callerIsDriver = kind === 'incoming';
          const callerIsAcceptor = (kind === 'mine' && passengerPost) || (kind === 'incoming' && !passengerPost);
          return (
            <article
              key={booking.id}
              className="animate-fade-up rounded-3xl border border-line bg-cream p-5 shadow-[var(--shadow-xs)]"
              style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_TONE[booking.status]}`}
                >
                  {STATUS_LABEL[booking.status]}
                </span>
                <span className="text-[11px] text-muted">
                  {booking.seatsRequested} seat{booking.seatsRequested === 1 ? '' : 's'}
                  {booking.postType
                    ? ` · ${booking.postType === 'PASSENGER' ? 'Passenger post' : 'Driver post'}`
                    : ''}
                </span>
              </div>

              <div className="mb-2">
                <p className="text-[17px] font-semibold text-ink">{booking.origin ?? 'Ride'}</p>
                {booking.destination ? (
                  <p className="text-sm text-muted">→ {booking.destination}</p>
                ) : null}
              </div>

              {booking.departureTime ? (
                <p className="mb-4 text-[13px] font-medium text-ink-2">{formatDeparture(booking.departureTime)}</p>
              ) : null}

              <div className="mb-4 flex items-center gap-3 border-t border-line-2 pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cream-2 to-line/60 ring-1 ring-line">
                  <span className="text-xs font-bold text-ink">{other[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-ink">@{other}</p>
                  <p className="text-[11px] text-muted">
                    {kind === 'incoming'
                      ? passengerPost
                        ? `You offered to drive @${booking.riderUsername}`
                        : `@${booking.riderUsername} requested ${booking.seatsRequested} seat${booking.seatsRequested === 1 ? '' : 's'}`
                      : passengerPost
                        ? `@${booking.driverUsername} offered to drive you`
                        : `Driver @${booking.driverUsername} · ${booking.seatsRequested} seat${booking.seatsRequested === 1 ? '' : 's'}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {booking.status === 'REQUESTED' ? (
                  callerIsAcceptor ? (
                    <>
                      <button
                        type="button"
                        onClick={() => runAction(() => api.bookings.accept(booking.id), 'Booking accepted.')}
                        className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream shadow-[var(--shadow-xs)] transition-all duration-150 hover:shadow-[var(--shadow-sm)] active:scale-95 cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => runAction(() => api.bookings.decline(booking.id), 'Booking declined.')}
                        className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-ink cursor-pointer"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => runAction(() => api.bookings.cancel(booking.id), 'Request cancelled.')}
                      className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-ink cursor-pointer"
                    >
                      Cancel
                    </button>
                  )
                ) : null}

                {booking.status === 'ACCEPTED' ? (
                  <>
                    {callerIsDriver ? (
                      <button
                        type="button"
                        onClick={() => runAction(() => api.bookings.complete(booking.id), 'Ride marked complete.')}
                        className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream shadow-[var(--shadow-xs)] transition-all duration-150 hover:shadow-[var(--shadow-sm)] active:scale-95 cursor-pointer"
                      >
                        Mark complete
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => runAction(() => api.bookings.cancel(booking.id), 'Booking cancelled.')}
                      className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-ink cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : null}

                {booking.status === 'COMPLETED' && !callerIsDriver ? (
                  <button
                    type="button"
                    onClick={() => setRateTarget(booking)}
                    className="rounded-full bg-coral px-4 py-2 text-xs font-semibold text-cream shadow-[var(--shadow-xs)] transition-all duration-150 hover:shadow-[var(--shadow-sm)] active:scale-95 cursor-pointer"
                  >
                    Rate ride
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => onOpenChat(other)}
                  className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-ink cursor-pointer"
                >
                  Message
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {rateTarget ? (
        <RateModal
          booking={rateTarget}
          otherUsername={otherUsername(rateTarget)}
          onClose={() => setRateTarget(null)}
          onRated={() => flash('Thanks for the review!')}
        />
      ) : null}
    </div>
  );
}

function RateModal({
  booking,
  otherUsername,
  onClose,
  onRated,
}: {
  booking: BookingResponse;
  otherUsername: string;
  onClose: () => void;
  onRated: () => void;
}) {
  const [stars, setStars] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleRate = async () => {
    setBusy(true);
    setError('');
    try {
      await api.ratings.create({
        bookingId: booking.id,
        stars,
        text: text.trim() || undefined,
      });
      onRated();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal title={`Rate @${otherUsername}`} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex justify-center gap-1.5" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStars(value)}
              onMouseEnter={() => setHovered(value)}
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
              className="cursor-pointer p-0.5 text-4xl leading-none transition-transform duration-100 ease-out hover:scale-110"
            >
              <span className={value <= (hovered || stars) ? 'text-sun' : 'text-line'}>★</span>
            </button>
          ))}
        </div>
        <Textarea
          label="Review (optional)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="How was the ride?"
        />
        {error ? <Banner tone="error">{error}</Banner> : null}
        <Button onClick={handleRate} size="lg" loading={busy}>
          {busy ? 'Submitting…' : 'Submit rating'}
        </Button>
      </div>
    </Modal>
  );
}
