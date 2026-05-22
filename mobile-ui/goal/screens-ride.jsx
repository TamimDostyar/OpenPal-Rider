/* global React, Icon, Avatar, Header, IconBtn, TabBar, avatarColor, RIDES */
// BuddyRide — Detail, Create, Messages, Chat, Profile

// ─── Ride detail ───────────────────────────────────────────────
function RideDetailScreen({ ride, onBack, onRequest, onMessage, requested = false }) {
  const seatsLeft = ride.seats - ride.taken;
  return (
    <div className="br-app" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* hero map placeholder */}
      <div style={{
        height: 220, background: 'var(--br-canvas)', position: 'relative', overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* stylized "map" with diagonal lines */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D6CFB8" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
          <path d="M 30 200 Q 120 80 200 110 T 380 60" stroke="var(--br-coral)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="6 4" />
          <circle cx="30" cy="200" r="6" fill="var(--br-ink)" />
          <rect x="375" y="55" width="10" height="10" fill="var(--br-coral)" rx="2" />
        </svg>
        <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
          <IconBtn name="back" onClick={onBack} bg="rgba(255,255,255,0.95)" />
          <IconBtn name="sparkle" bg="rgba(255,255,255,0.95)" />
        </div>
      </div>

      <div className="br-scroll" style={{ flex: 1, padding: '20px 20px 120px', marginTop: -24, background: 'var(--br-cream)', borderTopLeftRadius: 24, borderTopRightRadius: 24, position: 'relative', zIndex: 2 }}>
        {/* tags */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {ride.tags.map((t, i) => <div key={i} className="br-tag">{t}</div>)}
        </div>

        {/* route */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--br-ink)' }} />
            <div style={{ flex: 1, width: 2, background: 'var(--br-line)', minHeight: 32, margin: '4px 0' }} />
            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--br-coral)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Pickup · {ride.time}</div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{ride.from}</div>
            </div>
            <div style={{ height: 16 }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Dropoff · ETA {addDur(ride.time, ride.dur)}</div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{ride.to}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 18, marginBottom: 20 }}>
          <StatBox label="Date" value={ride.date} icon="cal" />
          <StatBox label="Duration" value={ride.dur} icon="clock" />
          <StatBox label="Gas split" value={ride.gas} icon="bolt" />
        </div>

        {/* driver card */}
        <div className="br-card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={ride.driver} size={52} color={avatarColor(ride.driver)} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{ride.driver}</span>
                <Icon name="shield" size={14} sw={2.4} stroke="var(--br-sage)" fill="var(--br-sage)" />
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--br-muted)' }}>
                {ride.year} · Westfield · joined Aug 2024
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12.5 }}>
                <Icon name="star" size={11} stroke="#F5B100" />
                <span style={{ fontWeight: 600 }}>{ride.rating.toFixed(2)}</span>
                <span style={{ color: 'var(--br-muted)' }}>({ride.trips} trips)</span>
              </div>
            </div>
            <button onClick={onMessage} style={{
              background: 'var(--br-cream-2)', border: 0, padding: '8px 14px',
              borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="chat" size={14} sw={2} /> Message
            </button>
          </div>
        </div>

        {/* car + seats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div className="br-card" style={{ flex: 1, padding: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--br-cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="car" size={20} sw={1.8} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Vehicle</div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{ride.car}</div>
            </div>
          </div>
          <div className="br-card" style={{ flex: 1, padding: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFE6E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--br-coral-dk)' }}>
              <Icon name="seat" size={20} sw={1.8} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Seats left</div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{seatsLeft} of {ride.seats}</div>
            </div>
          </div>
        </div>

        {/* trust */}
        <div className="br-card" style={{ padding: 16, marginBottom: 18, background: '#E5F0E9', border: '1px solid #C9DECF' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ color: 'var(--br-sage)', flexShrink: 0 }}>
              <Icon name="shield" size={22} sw={1.8} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--br-sage)' }}>Verified Westfield student</div>
              <div style={{ fontSize: 12.5, color: 'var(--br-sage)', opacity: 0.85, marginTop: 2 }}>
                ID · .edu email · phone · 3 friends in common
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* sticky CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 20px 28px', background: 'linear-gradient(to top, var(--br-cream) 70%, rgba(250,246,239,0))',
        display: 'flex', gap: 10, zIndex: 30,
      }}>
        <button onClick={onMessage} className="br-btn ghost" style={{ width: 54, height: 54, flexShrink: 0, padding: 0 }}>
          <Icon name="chat" size={20} sw={2} />
        </button>
        <button onClick={onRequest} className={'br-btn ' + (requested ? 'sage' : 'coral')} style={{ flex: 1 }}>
          {requested ? <><Icon name="check" size={18} sw={2.4} /> Request sent</> : <>Request seat · {ride.gas}</>}
        </button>
      </div>
    </div>
  );
}
window.RideDetailScreen = RideDetailScreen;

function StatBox({ label, value, icon }) {
  return (
    <div className="br-card" style={{ flex: 1, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--br-muted)', marginBottom: 2 }}>
        <Icon name={icon} size={12} sw={2} />
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function addDur(time, dur) {
  // Crude: just append for demo
  const [h, ampm] = time.split(' ');
  return time === '3:00 PM' ? '4:45 PM' : time === '6:15 PM' ? '6:55 PM' : time === '5:30 AM' ? '9:40 AM' : time === '7:00 PM' ? '7:20 PM' : '1:05 PM';
}

// ─── Create ride ───────────────────────────────────────────────
function CreateRideScreen({ onBack, onPost, onTab }) {
  const [seats, setSeats] = React.useState(3);
  const [from, setFrom] = React.useState('Campus, Wilson Hall');
  const [to, setTo] = React.useState('');
  const canPost = from && to;
  return (
    <div className="br-app" style={{ display: 'flex', flexDirection: 'column' }}>
      <Header
        left={<IconBtn name="close" onClick={onBack} />}
        title="Post a trip"
        right={<button onClick={onPost} disabled={!canPost} style={{
          appearance: 'none', border: 0, background: 'transparent', cursor: canPost ? 'pointer' : 'not-allowed',
          color: canPost ? 'var(--br-coral)' : 'var(--br-muted)', fontWeight: 700, fontSize: 14,
        }}>Post</button>}
      />

      <div className="br-scroll" style={{ flex: 1, padding: '4px 20px 120px' }}>
        <div className="br-mono" style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 4, marginBottom: 10 }}>
          Route
        </div>

        {/* Route inputs */}
        <div className="br-card" style={{ padding: 4 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px' }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--br-ink)', flexShrink: 0 }} />
            <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Leaving from" style={{
              flex: 1, border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: 15, fontWeight: 600,
            }} />
            <div style={{ fontSize: 11, color: 'var(--br-muted)' }}>Campus</div>
          </div>
          <div style={{ height: 1, background: 'var(--br-line)', margin: '0 14px' }} />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--br-coral)', flexShrink: 0 }} />
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="Going to…" style={{
              flex: 1, border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: 15, fontWeight: 600,
            }} />
          </div>
        </div>

        {/* quick destination chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, marginBottom: 22, overflowX: 'auto', margin: '10px -20px 22px', padding: '0 20px' }}>
          {['Logan Airport', 'JFK · NYC', 'Cambridge', 'Hartford', 'Trader Joe\'s'].map(d => (
            <div key={d} onClick={() => setTo(d)} className="br-chip" style={{ cursor: 'pointer' }}>
              <Icon name="pin" size={11} sw={2} /> {d}
            </div>
          ))}
        </div>

        <div className="br-mono" style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
          When
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          <div className="br-card" style={{ flex: 1, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Date</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              Fri · Mar 14 <Icon name="cal" size={14} sw={2} stroke="var(--br-muted)" />
            </div>
          </div>
          <div className="br-card" style={{ flex: 1, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Time</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              3:00 PM <Icon name="clock" size={14} sw={2} stroke="var(--br-muted)" />
            </div>
          </div>
        </div>

        <div className="br-mono" style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
          Seats available
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <button key={n} onClick={() => setSeats(n)} style={{
              flex: 1, height: 54, borderRadius: 14, cursor: 'pointer',
              background: seats === n ? 'var(--br-ink)' : 'white',
              color: seats === n ? 'var(--br-cream)' : 'var(--br-ink)',
              border: '1.5px solid ' + (seats === n ? 'var(--br-ink)' : 'var(--br-line)'),
              fontSize: 16, fontWeight: 700, font: 'inherit',
            }}>{n}</button>
          ))}
        </div>

        <div className="br-mono" style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
          Add details
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
          {['Big trunk', 'No smoking', 'Pet ok', 'Music ok', 'Quiet ride', '2 bags max', 'Female-only'].map(t => (
            <div key={t} className="br-chip" style={{ cursor: 'pointer' }}>
              <Icon name="plus" size={10} sw={2.4} /> {t}
            </div>
          ))}
        </div>

        <div style={{
          padding: 16, background: 'var(--br-cream-2)', borderRadius: 16,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <Icon name="bolt" size={18} sw={2} stroke="var(--br-coral-dk)" />
          <div style={{ fontSize: 13, color: 'var(--br-ink-2)', lineHeight: 1.5 }}>
            Suggested gas split: <b style={{ fontFamily: 'var(--br-mono)' }}>$16–20</b> per seat for Boston Logan. You'll confirm with riders.
          </div>
        </div>
      </div>

      <TabBar active="create" onChange={onTab} />
    </div>
  );
}
window.CreateRideScreen = CreateRideScreen;
