/* global React, Icon, Avatar, Header, IconBtn, TabBar, avatarColor */
// BuddyRide — Main app data + screens

const RIDES = [
  {
    id: 'r1', driver: 'Sarah Kim', year: 'Senior', rating: 4.97, trips: 42,
    from: 'Campus, Wilson Hall', to: 'Boston Logan · BOS',
    date: 'Fri · Mar 14', time: '3:00 PM', dur: '1h 45m',
    seats: 3, taken: 1, gas: '$18', car: 'Honda Civic · grey',
    tags: ['Airport', 'Music ok', '2 bags max'], fav: true,
  },
  {
    id: 'r2', driver: 'Marcus Thompson', year: 'Junior', rating: 4.85, trips: 17,
    from: 'Campus, Library', to: 'Cambridge · Harvard Sq',
    date: 'Tomorrow', time: '6:15 PM', dur: '40m',
    seats: 2, taken: 0, gas: '$6', car: 'Toyota Corolla',
    tags: ['Daily run', 'Quiet ride'],
  },
  {
    id: 'r3', driver: 'Diego Ramos', year: 'Sophomore', rating: 4.92, trips: 28,
    from: 'Campus', to: 'JFK Airport · NYC',
    date: 'Sat · Mar 15 · Spring break', time: '5:30 AM', dur: '4h 10m',
    seats: 3, taken: 2, gas: '$42', car: 'Subaru Outback',
    tags: ['Spring break', 'Big trunk', 'Pet ok'],
  },
  {
    id: 'r4', driver: 'Priya Mehra', year: 'Grad', rating: 5.00, trips: 11,
    from: 'East Campus lot', to: 'Trader Joe\'s · Northgate',
    date: 'Tonight', time: '7:00 PM', dur: '20m',
    seats: 3, taken: 1, gas: '$3', car: 'Honda CR-V',
    tags: ['Grocery run', 'Recurring · Thursdays'],
  },
  {
    id: 'r5', driver: 'Jamie Lee', year: 'Junior', rating: 4.78, trips: 9,
    from: 'Campus', to: 'Hartford CT · home',
    date: 'Sun · Mar 16', time: '11:00 AM', dur: '2h 5m',
    seats: 1, taken: 0, gas: '$22', car: 'Mazda 3',
    tags: ['Weekend'],
  },
];
window.RIDES = RIDES;

// ─── Ride card ─────────────────────────────────────────────────
function RideCard({ ride, onOpen, compact = false }) {
  const seatsLeft = ride.seats - ride.taken;
  const tight = seatsLeft <= 1;
  return (
    <div onClick={onOpen} className="br-card" style={{
      padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={ride.driver} size={36} color={avatarColor(ride.driver)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{ride.driver.split(' ')[0]} {ride.driver.split(' ')[1]?.[0]}.</span>
            <Icon name="shield" size={12} sw={2.4} stroke="var(--br-sage)" fill="var(--br-sage)" />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--br-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="star" size={10} stroke="#F5B100" />
            <span>{ride.rating.toFixed(2)}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{ride.trips} trips</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{ride.year}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--br-mono)' }}>~{ride.gas}</div>
          <div style={{ fontSize: 10, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>split gas</div>
        </div>
      </div>

      {/* route */}
      <div style={{ display: 'flex', gap: 12 }}>
        {/* dots column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--br-ink)' }} />
          <div style={{ flex: 1, width: 1.5, background: 'var(--br-line)', minHeight: 18, margin: '4px 0' }} />
          <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--br-coral)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{ride.from}</div>
          <div style={{ height: 18 }} />
          <div style={{ fontSize: 14, fontWeight: 600 }}>{ride.to}</div>
        </div>
      </div>

      {/* divider */}
      <div className="br-divider" />

      {/* meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--br-ink-2)' }}>
        <Icon name="cal" size={14} sw={2} stroke="var(--br-muted)" />
        <span style={{ fontWeight: 600 }}>{ride.date}</span>
        <span style={{ color: 'var(--br-muted)' }}>·</span>
        <span>{ride.time}</span>
        <span style={{ color: 'var(--br-muted)' }}>·</span>
        <span>{ride.dur}</span>
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: tight ? '#FFE6E0' : 'var(--br-cream-2)',
          color: tight ? 'var(--br-coral-dk)' : 'var(--br-ink-2)',
          padding: '4px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
        }}>
          <Icon name="seat" size={11} sw={2.2} />
          {seatsLeft} {seatsLeft === 1 ? 'seat' : 'seats'}
        </div>
      </div>
    </div>
  );
}
window.RideCard = RideCard;

// ─── Home / Browse ─────────────────────────────────────────────
function HomeScreen({ onOpenRide, onTab }) {
  const [filter, setFilter] = React.useState('all');
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'air', label: 'Airport' },
    { id: 'week', label: 'Weekend' },
    { id: 'daily', label: 'Daily' },
    { id: 'grocery', label: 'Errands' },
    { id: 'event', label: 'Events' },
  ];
  return (
    <div className="br-app" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* sticky header */}
      <div style={{ position: 'sticky', top: 0, background: 'var(--br-cream)', zIndex: 20, padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Logo size={22} />
          <div style={{ display: 'flex', gap: 8 }}>
            <IconBtn name="bell" badge />
            <IconBtn name="filter" />
          </div>
        </div>
        {/* search */}
        <div style={{
          background: 'white', border: '1px solid var(--br-line)', borderRadius: 16,
          padding: 4, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <div style={{ flex: 1, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>From</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Westfield Campus</div>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 999, background: 'var(--br-cream-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name="swap" size={14} sw={2} />
          </div>
          <div style={{ flex: 1, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>To</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--br-muted)' }}>Anywhere</div>
          </div>
        </div>
        {/* chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 14, margin: '0 -20px', padding: '0 20px 14px' }}>
          {filters.map(f => (
            <div key={f.id} onClick={() => setFilter(f.id)}
              className={'br-chip ' + (filter === f.id ? 'active' : '')}
              style={{ cursor: 'pointer' }}>
              {f.label}
            </div>
          ))}
        </div>
      </div>

      <div className="br-scroll" style={{ flex: 1, padding: '4px 20px 140px' }}>
        {/* upcoming for me */}
        <div style={{
          background: 'var(--br-sage)', color: 'var(--br-cream)',
          borderRadius: 18, padding: 16, marginBottom: 18, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 999, background: 'var(--br-sage-2)' }} />
          <div className="br-mono" style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4, position: 'relative' }}>
            Your next trip · in 2 days
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', position: 'relative' }}>
            Logan Airport
          </div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2, position: 'relative' }}>
            Fri 3:00 PM · with Sarah K. · 2 of 3 seats
          </div>
          <button onClick={() => onTab('messages')} style={{
            position: 'absolute', top: 16, right: 16, background: 'var(--br-cream)', color: 'var(--br-sage)',
            border: 0, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            Message
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>Rides nearby</h2>
          <span style={{ fontSize: 12, color: 'var(--br-muted)' }}>23 within 7 days</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {RIDES.map(r => <RideCard key={r.id} ride={r} onOpen={() => onOpenRide(r)} />)}
        </div>
      </div>

      <TabBar active="home" onChange={onTab} />
    </div>
  );
}
window.HomeScreen = HomeScreen;
