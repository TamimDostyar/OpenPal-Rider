import { iconGlobe, iconInstagram, iconLinkedin, iconCar } from '@/assets';
import { MOCK_PROFILE } from '@/mock/data';

const OPENPAL_LINKS = [
  { label: 'OpenPal on the web', caption: 'openpal.dev/palriders', icon: iconGlobe },
  { label: 'Follow on Instagram', caption: '@openpal.dev', icon: iconInstagram },
  { label: 'Follow on LinkedIn', caption: 'OpenPal', icon: iconLinkedin },
];

const ACCOUNT_LINKS = [
  { label: 'My rides & posts', icon: iconCar },
  { label: 'Vehicle on file', icon: iconCar },
  { label: 'Settings', icon: iconGlobe },
  { label: 'Terms & Privacy', icon: iconGlobe },
];

export function ProfileTab() {
  const profile = MOCK_PROFILE;
  const initials = profile.name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-col pb-8">
      <header className="px-5 pb-4 pt-2">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Profile</h1>
      </header>

      <div className="mx-5 mb-6 rounded-3xl border border-line bg-cream p-5">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cream-2 text-xl font-semibold text-ink">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-ink">{profile.name}</h2>
            <p className="text-sm text-muted">@{profile.username}</p>
            <p className="mt-1 text-sm text-ink-2">{profile.school}</p>
          </div>
        </div>

        {profile.bio ? (
          <p className="mb-4 text-sm leading-6 text-ink-2">{profile.bio}</p>
        ) : null}

        <div className="mb-4 grid grid-cols-3 gap-3 rounded-2xl bg-cream-2 p-3">
          <div className="text-center">
            <p className="text-lg font-bold text-ink">{profile.rating.toFixed(1)}</p>
            <p className="text-[11px] text-muted">{profile.reviewCount} reviews</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-ink">{profile.ridesGiven}</p>
            <p className="text-[11px] text-muted">Given</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-ink">{profile.ridesTaken}</p>
            <p className="text-[11px] text-muted">Taken</p>
          </div>
        </div>

        <button type="button" className="w-full rounded-full border border-line py-2.5 text-sm font-semibold text-ink">
          Edit profile
        </button>
      </div>

      <section className="mx-5 mb-6">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted">
          Account
        </p>
        <div className="overflow-hidden rounded-2xl border border-line bg-cream">
          {ACCOUNT_LINKS.map((link, i, arr) => (
            <button
              key={link.label}
              type="button"
              className={`flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-cream-2 ${
                i < arr.length - 1 ? 'border-b border-line-2' : ''
              }`}
            >
              <span className="flex items-center gap-3">
                <img src={link.icon} alt="" aria-hidden className="h-5 w-5 opacity-70" />
                <span className="text-sm font-medium text-ink">{link.label}</span>
              </span>
              <span className="text-muted">›</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-5 mb-6">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted">
          OpenPal
        </p>
        <div className="overflow-hidden rounded-2xl border border-line bg-cream">
          {OPENPAL_LINKS.map((link, i, arr) => (
            <button
              key={link.label}
              type="button"
              className={`flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-cream-2 ${
                i < arr.length - 1 ? 'border-b border-line-2' : ''
              }`}
            >
              <span className="flex items-center gap-3">
                <img src={link.icon} alt="" aria-hidden className="h-5 w-5 opacity-70" />
                <span>
                  <p className="text-sm font-medium text-ink">{link.label}</p>
                  <p className="text-xs text-muted">{link.caption}</p>
                </span>
              </span>
              <span className="text-muted">↗</span>
            </button>
          ))}
        </div>
      </section>

      <div className="mx-5">
        <button type="button" className="w-full rounded-full border border-line py-3 text-sm font-semibold text-coral">
          Sign out
        </button>
      </div>
    </div>
  );
}
