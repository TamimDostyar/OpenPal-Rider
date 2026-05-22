/* global React, Icon, Avatar, Header, IconBtn, TabBar, avatarColor */
// BuddyRide — Messages, Chat, Profile

const THREADS = [
  { id: 't1', name: 'Sarah Kim', last: 'Cool — I\'ll grab you at Wilson Hall 2:50pm', time: '12m', unread: 2, ride: 'Logan Airport · Fri', online: true },
  { id: 't2', name: 'Diego Ramos', last: 'How many bags are you bringing?', time: '1h', unread: 0, ride: 'JFK · Sat 3/15', online: false },
  { id: 't3', name: 'Marcus Thompson', last: 'You: Sounds good, see you then!', time: 'Wed', unread: 0, ride: 'Harvard Sq · tomorrow', online: false },
  { id: 't4', name: 'Priya Mehra', last: 'Trader Joe\'s 7pm? I have room', time: 'Tue', unread: 0, ride: 'Grocery run', online: true },
];
window.THREADS = THREADS;

// ─── Messages list ─────────────────────────────────────────────
function MessagesScreen({ onOpenChat, onTab }) {
  return (
    <div className="br-app" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }} className="br-serif">Inbox</h1>
            <div style={{ fontSize: 12.5, color: 'var(--br-muted)' }}>4 active conversations</div>
          </div>
          <IconBtn name="edit" />
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--br-line)', marginBottom: 8 }}>
          {['All', 'Rides', 'Requests'].map((t, i) => (
            <div key={t} style={{
              paddingBottom: 12, fontSize: 14, fontWeight: 600,
              color: i === 0 ? 'var(--br-ink)' : 'var(--br-muted)',
              borderBottom: i === 0 ? '2px solid var(--br-ink)' : '2px solid transparent',
              marginBottom: -1, cursor: 'pointer',
            }}>
              {t} {i === 2 && <span style={{
                background: 'var(--br-coral)', color: 'white', borderRadius: 999,
                padding: '1px 6px', fontSize: 10, marginLeft: 4,
              }}>2</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="br-scroll" style={{ flex: 1, padding: '4px 0 140px' }}>
        {THREADS.map(t => (
          <div key={t.id} onClick={() => onOpenChat(t)} style={{
            display: 'flex', gap: 12, alignItems: 'center',
            padding: '14px 20px', cursor: 'pointer',
          }}>
            <div style={{ position: 'relative' }}>
              <Avatar name={t.name} size={48} color={avatarColor(t.name)} />
              {t.online && <div style={{
                position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 999,
                background: '#5BB373', border: '2.5px solid var(--br-cream)',
              }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</span>
                <span style={{ fontSize: 11, color: 'var(--br-muted)' }}>· {t.ride}</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: 'var(--br-muted)', flexShrink: 0 }}>{t.time}</span>
              </div>
              <div style={{
                fontSize: 13, color: t.unread ? 'var(--br-ink)' : 'var(--br-muted)',
                fontWeight: t.unread ? 600 : 400,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginTop: 2,
              }}>{t.last}</div>
            </div>
            {t.unread > 0 && (
              <div style={{
                background: 'var(--br-coral)', color: 'white', borderRadius: 999,
                minWidth: 20, height: 20, padding: '0 6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>{t.unread}</div>
            )}
          </div>
        ))}
      </div>

      <TabBar active="messages" onChange={onTab} />
    </div>
  );
}
window.MessagesScreen = MessagesScreen;

// ─── Chat ──────────────────────────────────────────────────────
function ChatScreen({ thread, onBack }) {
  const [messages, setMessages] = React.useState([
    { id: 1, who: 'them', text: 'Hi Alex! Just confirming pickup for Friday — 3pm at Wilson Hall?', time: '11:42' },
    { id: 2, who: 'me', text: 'Yes, sounds good 🙏', time: '11:44' },
    { id: 3, who: 'me', text: 'How many bags are ok? I have a carry-on + small backpack.', time: '11:44' },
    { id: 4, who: 'them', text: 'Perfect, that\'s fine. Trunk has plenty of room.', time: '11:50' },
    { id: 5, who: 'them', text: 'Cool — I\'ll grab you at Wilson Hall 2:50pm', time: '12:01' },
  ]);
  const [draft, setDraft] = React.useState('');
  const scrollRef = React.useRef();
  React.useEffect(() => { scrollRef.current?.scrollTo(0, 1e9); }, [messages]);

  const send = () => {
    if (!draft.trim()) return;
    setMessages(m => [...m, { id: Date.now(), who: 'me', text: draft, time: 'now' }]);
    setDraft('');
  };

  const t = thread || THREADS[0];
  return (
    <div className="br-app" style={{ display: 'flex', flexDirection: 'column' }}>
      <Header
        left={<IconBtn name="back" onClick={onBack} />}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={t.name} size={32} color={avatarColor(t.name)} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--br-muted)', fontWeight: 500 }}>
                {t.online ? '· active now' : 'last seen 1h ago'}
              </div>
            </div>
          </div>
        }
        right={<IconBtn name="pin" />}
      />

      {/* ride context banner */}
      <div style={{
        margin: '0 16px 8px', padding: '10px 14px',
        background: 'var(--br-cream-2)', borderRadius: 14,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="car" size={16} sw={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>Logan Airport · Fri 3 PM</div>
          <div style={{ fontSize: 11, color: 'var(--br-muted)' }}>2 of 3 seats · gas $18</div>
        </div>
        <div className="br-tag sage"><Icon name="check" size={9} sw={3} /> confirmed</div>
      </div>

      <div ref={scrollRef} className="br-scroll" style={{ flex: 1, padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--br-muted)', margin: '4px 0 12px' }}>
          <span className="br-mono" style={{ letterSpacing: '0.08em' }}>TODAY · 11:42 AM</span>
        </div>
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const grouped = prev && prev.who === m.who;
          return (
            <div key={m.id} style={{
              alignSelf: m.who === 'me' ? 'flex-end' : 'flex-start',
              maxWidth: '78%', marginTop: grouped ? 0 : 6,
            }}>
              <div style={{
                background: m.who === 'me' ? 'var(--br-ink)' : 'white',
                color: m.who === 'me' ? 'var(--br-cream)' : 'var(--br-ink)',
                padding: '10px 14px',
                borderRadius: 18,
                borderTopRightRadius: m.who === 'me' && grouped ? 6 : 18,
                borderTopLeftRadius: m.who === 'them' && grouped ? 6 : 18,
                borderBottomRightRadius: m.who === 'me' ? 6 : 18,
                borderBottomLeftRadius: m.who === 'them' ? 6 : 18,
                fontSize: 14.5, lineHeight: 1.4,
                border: m.who === 'them' ? '1px solid var(--br-line-2)' : 0,
              }}>
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* composer */}
      <div style={{
        padding: '8px 14px 28px', display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--br-cream)', borderTop: '1px solid var(--br-line)',
      }}>
        <button style={{
          width: 40, height: 40, borderRadius: 999, border: '1px solid var(--br-line)',
          background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        }}>
          <Icon name="plus" size={18} sw={2} />
        </button>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Message…"
          style={{
            flex: 1, height: 40, padding: '0 16px',
            background: 'white', border: '1px solid var(--br-line)',
            borderRadius: 999, outline: 0, font: 'inherit', fontSize: 14,
          }}
        />
        <button onClick={send} style={{
          width: 40, height: 40, borderRadius: 999, border: 0,
          background: 'var(--br-coral)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        }}>
          <Icon name="send" size={16} sw={2} />
        </button>
      </div>
    </div>
  );
}
window.ChatScreen = ChatScreen;

// ─── Profile ───────────────────────────────────────────────────
function ProfileScreen({ onTab }) {
  return (
    <div className="br-app" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="br-scroll" style={{ flex: 1, paddingBottom: 140 }}>
        {/* header */}
        <div style={{
          background: 'var(--br-cream-2)', padding: '20px 20px 28px',
          borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <IconBtn name="edit" />
            <IconBtn name="filter" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
            <Avatar name="Alex Rivera" size={76} color="var(--br-coral)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="br-serif" style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em' }}>Alex Rivera</span>
                <Icon name="shield" size={16} sw={2.4} stroke="var(--br-sage)" fill="var(--br-sage)" />
              </div>
              <div style={{ fontSize: 13, color: 'var(--br-ink-2)' }}>Junior · Westfield Univ.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Icon name="star" size={12} stroke="#F5B100" />
                <span style={{ fontWeight: 700, fontSize: 13 }}>4.96</span>
                <span style={{ fontSize: 12, color: 'var(--br-muted)' }}>· 23 trips · joined Aug '24</span>
              </div>
            </div>
          </div>

          {/* role toggle */}
          <div style={{ display: 'flex', background: 'var(--br-cream)', borderRadius: 999, padding: 4, marginTop: 16 }}>
            <div style={{
              flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 999,
              background: 'var(--br-ink)', color: 'var(--br-cream)', fontWeight: 700, fontSize: 13,
            }}>Rider</div>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', color: 'var(--br-muted)', fontWeight: 600, fontSize: 13 }}>Driver</div>
          </div>
        </div>

        {/* trust + verification */}
        <div style={{ padding: '20px' }}>
          <div className="br-mono" style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
            Trust score
          </div>
          <div className="br-card" style={{ padding: 16, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>4 of 5 checks complete</span>
              <span style={{ fontFamily: 'var(--br-mono)', fontSize: 12, color: 'var(--br-sage)', fontWeight: 700 }}>80%</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: 'var(--br-cream-2)', overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ width: '80%', height: '100%', background: 'var(--br-sage)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['.edu email', true],
                ['Phone number', true],
                ['Student ID photo', true],
                ['Selfie match', true],
                ['Driver\'s license', false],
              ].map(([label, done]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 999,
                    background: done ? 'var(--br-sage)' : 'var(--br-cream-2)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done && <Icon name="check" size={10} sw={3.5} stroke="white" />}
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: done ? 500 : 600, color: done ? 'var(--br-ink-2)' : 'var(--br-ink)' }}>
                    {label}
                  </span>
                  {!done && <span style={{
                    marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                    color: 'var(--br-coral-dk)', textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>Add →</span>}
                </div>
              ))}
            </div>
          </div>

          {/* stats grid */}
          <div className="br-mono" style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
            Activity
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            <div className="br-card" style={{ padding: 14 }}>
              <div className="br-serif" style={{ fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>23</div>
              <div style={{ fontSize: 12, color: 'var(--br-muted)', marginTop: 2 }}>trips · 4 as driver</div>
            </div>
            <div className="br-card" style={{ padding: 14 }}>
              <div className="br-serif" style={{ fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>$184</div>
              <div style={{ fontSize: 12, color: 'var(--br-muted)', marginTop: 2 }}>saved vs Uber</div>
            </div>
            <div className="br-card" style={{ padding: 14 }}>
              <div className="br-serif" style={{ fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>1,470</div>
              <div style={{ fontSize: 12, color: 'var(--br-muted)', marginTop: 2 }}>miles shared</div>
            </div>
            <div className="br-card" style={{ padding: 14, background: 'var(--br-sage)', color: 'var(--br-cream)' }}>
              <div className="br-serif" style={{ fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>4.96</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>★ avg · 17 reviews</div>
            </div>
          </div>

          {/* recent review */}
          <div className="br-mono" style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
            Recent review
          </div>
          <div className="br-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <Avatar name="Jordan B" size={32} color={avatarColor('Jordan B')} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Jordan B.</div>
                <div style={{ fontSize: 11, color: 'var(--br-muted)' }}>Westfield · 3 days ago</div>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(i => <Icon key={i} name="star" size={11} stroke="#F5B100" />)}
              </div>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--br-ink-2)' }}>
              "Super easy ride to Cambridge. Alex was on time and chill. Would def ride again."
            </div>
          </div>
        </div>
      </div>

      <TabBar active="profile" onChange={onTab} />
    </div>
  );
}
window.ProfileScreen = ProfileScreen;
