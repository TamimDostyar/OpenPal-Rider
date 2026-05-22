/* global React, Icon, Avatar, Header, IconBtn, TabBar, avatarColor */
// BuddyRide — Onboarding screens

function Logo({ size = 28, color = 'var(--br-ink)', accent = 'var(--br-coral)' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 32 32">
        <circle cx="11" cy="16" r="9" fill={accent} />
        <circle cx="21" cy="16" r="9" fill={color} style={{ mixBlendMode: 'multiply' }} />
      </svg>
      <span style={{
        fontFamily: 'var(--br-serif)', fontSize: size * 0.95,
        color, fontWeight: 400, letterSpacing: '-0.04em',
        lineHeight: 1,
      }}>buddyride</span>
    </div>
  );
}
window.Logo = Logo;

// ─── 1. Welcome ────────────────────────────────────────────────
function WelcomeScreen({ onContinue }) {
  return (
    <div className="br-app br-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* hero panel */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'var(--br-sage)', color: 'var(--br-cream)',
        borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
        padding: '64px 28px 36px', minHeight: 540,
      }}>
        {/* deco dots */}
        <div style={{ position: 'absolute', top: 80, right: -30, width: 160, height: 160, borderRadius: 999, background: 'var(--br-coral)', opacity: 0.95 }} />
        <div style={{ position: 'absolute', top: 130, right: 80, width: 100, height: 100, borderRadius: 999, background: 'var(--br-sun)' }} />
        <div style={{ position: 'absolute', top: 60, left: -20, width: 60, height: 60, borderRadius: 999, background: 'var(--br-rose)', opacity: 0.6 }} />

        <Logo size={24} color="var(--br-cream)" accent="var(--br-coral)" />

        <div style={{ position: 'absolute', bottom: 36, left: 28, right: 28 }}>
          <div className="br-mono" style={{ fontSize: 11, opacity: 0.7, marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            ·001 · students only
          </div>
          <div className="br-serif" style={{ fontSize: 46, lineHeight: 0.98, marginBottom: 18, letterSpacing: '-0.03em' }}>
            Rides between<br/>classmates,<br/>not strangers.
          </div>
          <div style={{ fontSize: 15, opacity: 0.78, maxWidth: 280, lineHeight: 1.45 }}>
            A campus-only carpool community. Verified .edu, real names, real reviews.
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 20px 28px' }}>
        <button className="br-btn coral" onClick={onContinue}>
          Continue with .edu email
          <Icon name="arrow" size={18} sw={2.2} />
        </button>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--br-muted)' }}>
          Already have an account? <span style={{ color: 'var(--br-ink)', fontWeight: 600 }}>Log in</span>
        </div>
      </div>
    </div>
  );
}
window.WelcomeScreen = WelcomeScreen;

// ─── 2. Signup (email entry) ───────────────────────────────────
function SignupScreen({ onBack, onSubmit }) {
  const [email, setEmail] = React.useState('alex.rivera@westfield.edu');
  const valid = email.endsWith('.edu') && email.includes('@');
  return (
    <div className="br-app" style={{ display: 'flex', flexDirection: 'column' }}>
      <Header left={<IconBtn name="back" onClick={onBack} />} title="" />
      <div style={{ padding: '4px 24px 20px', flex: 1 }}>
        <div className="br-mono" style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 14 }}>
          Step 1 of 3 · verify
        </div>
        <div className="br-serif" style={{ fontSize: 36, lineHeight: 1.0, marginBottom: 10, letterSpacing: '-0.02em' }}>
          Use your<br/>campus email.
        </div>
        <div style={{ fontSize: 14.5, color: 'var(--br-ink-2)', marginBottom: 28, lineHeight: 1.5 }}>
          We send a one-time code. Your address is never shown to other students.
        </div>

        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          .edu address
        </label>
        <input
          className="br-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@school.edu"
          style={{ marginTop: 8, fontFamily: 'var(--br-mono)', fontSize: 15 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, color: valid ? 'var(--br-sage)' : 'var(--br-muted)' }}>
          <Icon name="shield" size={16} sw={2} />
          <span style={{ fontSize: 13 }}>
            {valid ? 'westfield.edu is supported' : 'Must end in .edu'}
          </span>
        </div>

        <div style={{ marginTop: 36, padding: 18, background: 'var(--br-cream-2)', borderRadius: 16, display: 'flex', gap: 14 }}>
          <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 999, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--br-sage)' }}>
            <Icon name="school" size={18} sw={2} />
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--br-ink-2)', lineHeight: 1.5 }}>
            Currently live at <b>Westfield University</b>.{' '}
            <span style={{ color: 'var(--br-coral-dk)', fontWeight: 600 }}>Not your school?</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 24px 28px' }}>
        <button className="br-btn" disabled={!valid} onClick={onSubmit}
          style={!valid ? { opacity: 0.4, pointerEvents: 'none' } : null}>
          Send code
        </button>
      </div>
    </div>
  );
}
window.SignupScreen = SignupScreen;

// ─── 3. Verify (6-digit code) ──────────────────────────────────
function VerifyScreen({ onBack, onSubmit }) {
  const [code, setCode] = React.useState(['4', '8', '2', '', '', '']);
  const refs = React.useRef([]);
  const filled = code.every(c => c !== '');
  const set = (i, v) => {
    const c = [...code];
    c[i] = v.slice(-1);
    setCode(c);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  React.useEffect(() => { if (filled) setTimeout(onSubmit, 400); }, [filled]);
  return (
    <div className="br-app" style={{ display: 'flex', flexDirection: 'column' }}>
      <Header left={<IconBtn name="back" onClick={onBack} />} title="" />
      <div style={{ padding: '4px 24px 20px', flex: 1 }}>
        <div className="br-mono" style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 14 }}>
          Step 1 of 3 · code sent
        </div>
        <div className="br-serif" style={{ fontSize: 36, lineHeight: 1.0, marginBottom: 10, letterSpacing: '-0.02em' }}>
          Check your<br/>inbox.
        </div>
        <div style={{ fontSize: 14.5, color: 'var(--br-ink-2)', marginBottom: 36, lineHeight: 1.5 }}>
          We sent a 6-digit code to{' '}
          <span className="br-mono" style={{ fontSize: 13.5, color: 'var(--br-ink)' }}>alex.rivera@westfield.edu</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {code.map((d, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              value={d}
              onChange={e => set(i, e.target.value.replace(/\D/, ''))}
              onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus(); }}
              maxLength={1}
              inputMode="numeric"
              style={{
                flex: 1, height: 64, textAlign: 'center',
                background: d ? 'var(--br-ink)' : 'white',
                color: d ? 'var(--br-cream)' : 'var(--br-ink)',
                border: '1.5px solid ' + (d ? 'var(--br-ink)' : 'var(--br-line)'),
                borderRadius: 14, fontSize: 24, fontWeight: 600,
                fontFamily: 'var(--br-mono)', outline: 'none',
                padding: 0,
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
          <span style={{ color: 'var(--br-muted)' }}>Didn't get it?</span>
          <span style={{ color: 'var(--br-ink)', fontWeight: 600 }}>Resend in 0:24</span>
        </div>
      </div>
    </div>
  );
}
window.VerifyScreen = VerifyScreen;

// ─── 4. Profile setup ──────────────────────────────────────────
function ProfileSetupScreen({ onBack, onSubmit }) {
  const [role, setRole] = React.useState('both');
  const [name, setName] = React.useState('Alex Rivera');
  const [year, setYear] = React.useState('Junior');

  const roleOpt = (id, label, desc, icon) => {
    const active = role === id;
    return (
      <button onClick={() => setRole(id)} style={{
        appearance: 'none', border: '1.5px solid ' + (active ? 'var(--br-ink)' : 'var(--br-line)'),
        background: active ? 'var(--br-ink)' : 'white',
        color: active ? 'var(--br-cream)' : 'var(--br-ink)',
        borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
        display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left',
        width: '100%',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 999, flexShrink: 0,
          background: active ? 'var(--br-coral)' : 'var(--br-cream-2)',
          color: active ? 'white' : 'var(--br-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={18} sw={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{label}</div>
          <div style={{ fontSize: 12.5, opacity: 0.7 }}>{desc}</div>
        </div>
        <div style={{
          width: 20, height: 20, borderRadius: 999,
          border: '1.5px solid ' + (active ? 'var(--br-coral)' : 'var(--br-line)'),
          background: active ? 'var(--br-coral)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {active && <Icon name="check" size={12} sw={3} stroke="white" />}
        </div>
      </button>
    );
  };

  return (
    <div className="br-app" style={{ display: 'flex', flexDirection: 'column' }}>
      <Header left={<IconBtn name="back" onClick={onBack} />} title="" />
      <div className="br-scroll" style={{ flex: 1, padding: '4px 24px 20px' }}>
        <div className="br-mono" style={{ fontSize: 11, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 14 }}>
          Step 2 of 3 · profile
        </div>
        <div className="br-serif" style={{ fontSize: 32, lineHeight: 1.0, marginBottom: 22, letterSpacing: '-0.02em' }}>
          The basics.
        </div>

        {/* avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ position: 'relative' }}>
            <Avatar name={name} size={72} color="var(--br-coral)" />
            <div style={{
              position: 'absolute', bottom: -2, right: -2, width: 28, height: 28,
              borderRadius: 999, background: 'var(--br-ink)', color: 'var(--br-cream)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--br-cream)',
            }}>
              <Icon name="plus" size={14} sw={2.4} />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Add a photo</div>
            <div style={{ fontSize: 12.5, color: 'var(--br-muted)' }}>Real photos build trust</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Full name
            </label>
            <input className="br-input" value={name} onChange={e => setName(e.target.value)} style={{ marginTop: 6 }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                School
              </label>
              <div className="br-input" style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--br-cream-2)' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Westfield Univ.</span>
                <div className="br-tag verified"><Icon name="check" size={9} sw={3} /> verified</div>
              </div>
            </div>
            <div style={{ width: 120 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Year
              </label>
              <select value={year} onChange={e => setYear(e.target.value)} className="br-input" style={{ marginTop: 6, appearance: 'none', fontSize: 14, fontWeight: 600 }}>
                <option>Freshman</option><option>Sophomore</option><option>Junior</option><option>Senior</option><option>Grad</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--br-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            How will you use BuddyRide?
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {roleOpt('rider', 'I need rides', 'Find drivers heading my way', 'seat')}
            {roleOpt('driver', "I'll drive", 'Post my trips & split gas', 'car')}
            {roleOpt('both', 'Both', 'Switch any time', 'swap')}
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 24px 28px' }}>
        <button className="br-btn coral" onClick={onSubmit}>
          Continue
          <Icon name="arrow" size={18} sw={2.2} />
        </button>
      </div>
    </div>
  );
}
window.ProfileSetupScreen = ProfileSetupScreen;
