import { MOCK_BOOKINGS } from '@/mock/data';

const STATUS_LABEL = {
  REQUESTED: 'Requested',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
} as const;

const STATUS_COLOR = {
  REQUESTED: 'bg-sun',
  ACCEPTED: 'bg-sage',
  DECLINED: 'bg-line',
  CANCELLED: 'bg-line',
  COMPLETED: 'bg-sky',
} as const;

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

export function BookingsTab() {
  return (
    <div className="flex flex-col">
      <header className="px-5 pb-4 pt-2">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Bookings</h1>
        <p className="mt-1 text-sm text-muted">Track ride requests and offers</p>
      </header>

      <div className="mx-5 mb-4 flex rounded-full border border-line bg-cream-2 p-1">
        <button type="button" className="flex-1 rounded-full bg-ink py-2 text-xs font-semibold text-cream">
          My requests
        </button>
        <button type="button" className="flex-1 rounded-full py-2 text-xs font-semibold text-muted">
          Incoming
        </button>
      </div>

      <div className="flex flex-col gap-3 px-5 pb-8">
        {MOCK_BOOKINGS.map((booking) => (
          <article key={booking.id} className="rounded-2xl border border-line bg-cream p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white ${STATUS_COLOR[booking.status]}`}
              >
                {STATUS_LABEL[booking.status]}
              </span>
              <span className="text-[11px] text-muted">
                {booking.postType === 'PASSENGER' ? 'Passenger post' : 'Driver post'}
              </span>
            </div>

            <div className="mb-2">
              <p className="text-base font-semibold text-ink">{booking.origin}</p>
              <p className="text-sm text-muted">→ {booking.destination}</p>
            </div>

            <p className="mb-3 text-[13px] text-ink-2">{formatDeparture(booking.departureTime)}</p>

            <div className="mb-4 flex items-center gap-3 border-t border-line-2 pt-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-2">
                <span className="text-xs font-semibold text-ink">
                  {booking.otherName[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-ink">{booking.otherName}</p>
                <p className="text-[11px] text-muted">@{booking.otherUsername}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {booking.status === 'REQUESTED' ? (
                <>
                  <button type="button" className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream">
                    Accept
                  </button>
                  <button type="button" className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink">
                    Decline
                  </button>
                </>
              ) : null}
              {booking.status === 'ACCEPTED' ? (
                <>
                  <button type="button" className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream">
                    Mark complete
                  </button>
                  <button type="button" className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink">
                    Cancel
                  </button>
                </>
              ) : null}
              {booking.status === 'COMPLETED' ? (
                <button type="button" className="rounded-full bg-coral px-4 py-2 text-xs font-semibold text-cream">
                  Rate ride
                </button>
              ) : null}
              <button type="button" className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink">
                Message
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
