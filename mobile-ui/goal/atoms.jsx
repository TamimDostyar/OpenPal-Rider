/* global React */
// BuddyRide — shared atoms

// Icon set (minimal stroke icons)
function Icon({ name, size = 22, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill, stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const ic = {
    arrow:    <svg {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
    back:     <svg {...p}><path d="M19 12H5M11 19l-7-7 7-7"/></svg>,
    close:    <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
    search:   <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>,
    plus:     <svg {...p}><path d="M12 5v14M5 12h14"/></svg>,
    home:     <svg {...p}><path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V11z"/></svg>,
    chat:     <svg {...p}><path d="M21 12a8 8 0 01-11.5 7.2L4 21l1.8-5.5A8 8 0 1121 12z"/></svg>,
    user:     <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>,
    pin:      <svg {...p}><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>,
    car:      <svg {...p}><path d="M3 13l2-5a3 3 0 013-2h8a3 3 0 013 2l2 5v5a1 1 0 01-1 1h-2v-2H6v2H4a1 1 0 01-1-1v-5z"/><circle cx="7.5" cy="15.5" r="1.2"/><circle cx="16.5" cy="15.5" r="1.2"/></svg>,
    cal:      <svg {...p}><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>,
    clock:    <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
    star:     <svg {...p} fill={stroke}><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.7 6.6 19.5l1.2-6-4.5-4.2 6.1-.7L12 3z"/></svg>,
    shield:   <svg {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>,
    check:    <svg {...p}><path d="M4 12l5 5L20 6"/></svg>,
    filter:   <svg {...p}><path d="M4 6h16M7 12h10M10 18h4"/></svg>,
    send:     <svg {...p}><path d="M4 12l16-8-5 18-4-7-7-3z"/></svg>,
    bell:     <svg {...p}><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 004 0"/></svg>,
    edit:     <svg {...p}><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/></svg>,
    swap:     <svg {...p}><path d="M7 7h13l-3-3M17 17H4l3 3"/></svg>,
    seat:     <svg {...p}><path d="M6 21V11a3 3 0 013-3h6a3 3 0 013 3v10M3 21h18M9 8V5a3 3 0 016 0v3"/></svg>,
    luggage:  <svg {...p}><rect x="5" y="7" width="14" height="13" rx="2"/><path d="M9 7V4h6v3M9 11v5M15 11v5"/></svg>,
    bolt:     <svg {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>,
    school:   <svg {...p}><path d="M3 9l9-5 9 5-9 5-9-5z"/><path d="M7 11v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5"/></svg>,
    sparkle:  <svg {...p}><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/></svg>,
  };
  return ic[name] || null;
}
window.Icon = Icon;

// Avatar
function Avatar({ name = '?', size = 36, color = '#FF5B43', src }) {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  if (src) {
    return <div className="br-avatar" style={{ width: size, height: size, background: src, backgroundSize: 'cover', backgroundPosition: 'center' }} />;
  }
  return (
    <div className="br-avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}
window.Avatar = Avatar;

// Tab bar
function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Rides' },
    { id: 'create', icon: 'plus', label: 'Post' },
    { id: 'messages', icon: 'chat', label: 'Inbox' },
    { id: 'profile', icon: 'user', label: 'You' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 8,
      background: 'linear-gradient(to top, var(--br-cream) 65%, rgba(250,246,239,0.92) 85%, rgba(250,246,239,0) 100%)',
      zIndex: 30,
    }}>
      <div style={{
        margin: '0 16px', height: 64, borderRadius: 999,
        background: 'var(--br-ink)', color: 'var(--br-cream)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 8px',
      }}>
        {tabs.map(t => {
          const isActive = active === t.id;
          const isCreate = t.id === 'create';
          return (
            <button key={t.id} onClick={() => onChange(t.id)} style={{
              appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
              width: 56, height: 48, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              color: isActive ? 'var(--br-cream)' : 'rgba(250,246,239,0.45)',
              position: 'relative',
            }}>
              {isCreate ? (
                <div style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: isActive ? 'var(--br-coral)' : 'var(--br-coral)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white',
                }}>
                  <Icon name="plus" size={22} sw={2.4} />
                </div>
              ) : (
                <>
                  <Icon name={t.icon} size={22} sw={isActive ? 2.2 : 1.8} />
                  <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 0.02 }}>{t.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
window.TabBar = TabBar;

// Top header (custom, replaces iOS nav)
function Header({ title, left, right, sticky = true, transparent = false }) {
  return (
    <div style={{
      position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 20,
      background: transparent ? 'transparent' : 'var(--br-cream)',
      padding: '12px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 8,
    }}>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-start' }}>{left}</div>
      <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}
window.Header = Header;

// Round icon button
function IconBtn({ name, onClick, size = 40, bg = 'white', stroke = 'var(--br-ink)', badge }) {
  return (
    <button onClick={onClick} style={{
      appearance: 'none', border: '1px solid var(--br-line)', cursor: 'pointer',
      width: size, height: size, borderRadius: 999,
      background: bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', flexShrink: 0,
    }}>
      <Icon name={name} size={18} stroke={stroke} />
      {badge && (
        <div style={{
          position: 'absolute', top: 4, right: 4, width: 9, height: 9, borderRadius: 999,
          background: 'var(--br-coral)', border: '1.5px solid white',
        }} />
      )}
    </button>
  );
}
window.IconBtn = IconBtn;

// Avatar color palette by seed
const AVATAR_COLORS = ['#FF5B43', '#2C4A3E', '#F5D27A', '#7A9CC6', '#C97B89', '#5C4A8C', '#B96A2E', '#3D6354'];
function avatarColor(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
window.avatarColor = avatarColor;
