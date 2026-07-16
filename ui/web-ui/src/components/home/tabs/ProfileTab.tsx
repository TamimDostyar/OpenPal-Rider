import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import type { FeedPostResponse, MyProfile } from '@/api/types';
import { errorMessage, useApiData } from '@/hooks/useApi';
import { session } from '@/auth/session';
import { formatDeparture, initialsOf } from '@/lib/format';
import { iconGlobe, iconInstagram, iconLinkedin, iconCar } from '@/assets';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Textarea } from '@/components/ui/Textarea';
import { Banner } from '@/components/ui/Banner';
import { EmptyState } from '@/components/ui/EmptyState';
import { LegalModal } from '@/components/legal/LegalModal';

const OPENPAL_LINKS = [
  { label: 'OpenPal on the web', caption: 'openpal.dev/palriders', icon: iconGlobe, href: 'https://openpal.dev' },
  { label: 'Follow on Instagram', caption: '@openpal.dev', icon: iconInstagram, href: 'https://instagram.com/openpal.dev' },
  { label: 'Follow on LinkedIn', caption: 'OpenPal', icon: iconLinkedin, href: 'https://www.linkedin.com/company/openpal' },
];

type Panel = 'rides' | 'vehicle' | 'blocked' | 'terms' | 'privacy' | 'bio' | null;

interface ProfileTabProps {
  me: MyProfile | null;
  reloadMe: () => void;
}

function ListRow({
  icon,
  label,
  caption,
  onClick,
  href,
  external,
  border,
}: {
  icon: string;
  label: string;
  caption?: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  border: boolean;
}) {
  const content = (
    <>
      <span className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-2">
          <img src={icon} alt="" aria-hidden className="h-4.5 w-4.5 opacity-70" />
        </span>
        <span>
          <span className="block text-sm font-medium text-ink">{label}</span>
          {caption ? <span className="block text-xs text-muted">{caption}</span> : null}
        </span>
      </span>
      <span className="text-muted transition-transform duration-150 ease-out group-hover:translate-x-0.5">
        {external ? '↗' : '›'}
      </span>
    </>
  );

  const className = `group flex w-full items-center justify-between px-4 py-3.5 text-left no-underline transition-colors hover:bg-cream-2 cursor-pointer ${
    border ? 'border-b border-line-2' : ''
  }`;

  if (href) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className={className}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export function ProfileTab({ me, reloadMe }: ProfileTabProps) {
  const navigate = useNavigate();
  const [panel, setPanel] = useState<Panel>(null);
  const [notice, setNotice] = useState('');

  const { data: ratings } = useApiData(
    () => (me ? api.ratings.forUser(me.username) : Promise.resolve(null)),
    [me?.username],
  );
  const { data: myRides, reload: reloadRides } = useApiData(() => api.feed.myRides());

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 4000);
  };

  const handleSignOut = () => {
    session.clear();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'Delete your account? Your profile, posts, and messages will be removed. This cannot be undone.',
      )
    )
      return;
    try {
      await api.profile.deleteAccount();
      session.clear();
      navigate('/');
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  const displayName = me?.name || me?.username || '…';
  const initials = initialsOf(displayName);

  const ACCOUNT_LINKS: { label: string; icon: string; panel: Panel }[] = [
    { label: 'My rides & posts', icon: iconCar, panel: 'rides' },
    { label: 'Vehicle on file', icon: iconCar, panel: 'vehicle' },
    { label: 'Blocked users', icon: iconGlobe, panel: 'blocked' },
    { label: 'Terms & Conditions', icon: iconGlobe, panel: 'terms' },
    { label: 'Privacy Policy', icon: iconGlobe, panel: 'privacy' },
  ];

  return (
    <div className="flex flex-col pb-8">
      <header className="px-5 pb-5 pt-4">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-ink sm:text-3xl">Profile</h1>
      </header>

      {notice ? (
        <div className="mx-5 mb-3">
          <Banner tone="success">{notice}</Banner>
        </div>
      ) : null}

      <div className="mx-5 mb-6 overflow-hidden rounded-3xl border border-line bg-cream shadow-[var(--shadow-xs)]">
        <div className="h-16 bg-gradient-to-br from-coral/15 via-cream-2 to-sage/10" />
        <div className="px-5 pb-5">
          <div className="-mt-8 mb-4 flex items-end gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cream-2 to-line/60 text-xl font-bold text-ink ring-4 ring-cream">
              {initials}
            </div>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-ink">{displayName}</h2>
            {me ? <p className="text-sm text-muted">@{me.username}</p> : null}
            {me?.school ? <p className="mt-1 text-sm text-ink-2">{me.school}</p> : null}
            {me?.driverVerified ? (
              <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-driver-bg px-2.5 py-1 text-[11px] font-semibold text-driver">
                Vehicle on file
              </p>
            ) : null}
          </div>

          {me?.bio ? <p className="mb-4 text-sm leading-6 text-ink-2">{me.bio}</p> : null}

          <div className="mb-4 grid grid-cols-3 gap-3 rounded-2xl bg-cream-2 p-3">
            <div className="text-center">
              <p className="text-lg font-bold text-ink">
                {ratings && ratings.count > 0 ? ratings.average.toFixed(1) : '—'}
              </p>
              <p className="text-[11px] text-muted">
                {ratings?.count ?? 0} review{(ratings?.count ?? 0) === 1 ? '' : 's'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-ink">{myRides?.length ?? 0}</p>
              <p className="text-[11px] text-muted">Posts</p>
            </div>
            <div className="text-center">
              <p className="truncate text-lg font-bold text-ink">{me?.email ? me.email.split('@')[1] : '—'}</p>
              <p className="text-[11px] text-muted">Campus</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPanel('bio')}
            className="w-full rounded-full border border-line py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-cream-2 cursor-pointer"
          >
            Edit bio
          </button>
        </div>
      </div>

      <section className="mx-5 mb-6">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted">Account</p>
        <div className="overflow-hidden rounded-2xl border border-line bg-cream shadow-[var(--shadow-xs)]">
          {ACCOUNT_LINKS.map((link, i, arr) => (
            <ListRow
              key={link.label}
              icon={link.icon}
              label={link.label}
              onClick={() => setPanel(link.panel)}
              border={i < arr.length - 1}
            />
          ))}
        </div>
      </section>

      <section className="mx-5 mb-6">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted">OpenPal</p>
        <div className="overflow-hidden rounded-2xl border border-line bg-cream shadow-[var(--shadow-xs)]">
          {OPENPAL_LINKS.map((link, i, arr) => (
            <ListRow
              key={link.label}
              icon={link.icon}
              label={link.label}
              caption={link.caption}
              href={link.href}
              external
              border={i < arr.length - 1}
            />
          ))}
        </div>
      </section>

      <div className="mx-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full rounded-full border border-line py-3 text-sm font-semibold text-coral transition-colors hover:border-coral hover:bg-passenger-bg cursor-pointer"
        >
          Sign out
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="w-full border-0 bg-transparent py-1 text-xs font-medium text-muted underline transition-colors hover:text-coral cursor-pointer"
        >
          Delete my account
        </button>
      </div>

      {panel === 'bio' && me ? (
        <EditBioModal
          me={me}
          onClose={() => setPanel(null)}
          onSaved={() => {
            flash('Bio updated.');
            reloadMe();
          }}
        />
      ) : null}

      {panel === 'rides' ? (
        <MyRidesModal
          rides={myRides ?? []}
          onClose={() => setPanel(null)}
          onDeleted={() => {
            flash('Post deleted.');
            void reloadRides();
          }}
        />
      ) : null}

      {panel === 'vehicle' ? (
        <VehicleModal
          onClose={() => setPanel(null)}
          onSaved={() => {
            flash('Vehicle saved.');
            reloadMe();
          }}
        />
      ) : null}

      {panel === 'blocked' ? <BlockedUsersModal onClose={() => setPanel(null)} /> : null}

      {panel === 'terms' || panel === 'privacy' ? (
        <LegalModal kind={panel} onClose={() => setPanel(null)} />
      ) : null}
    </div>
  );
}

function EditBioModal({
  me,
  onClose,
  onSaved,
}: {
  me: MyProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [bio, setBio] = useState(me.bio ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    setBusy(true);
    setError('');
    try {
      await api.profile.updateBio(bio.trim());
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal title="Edit bio" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <Textarea
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Tell riders a little about yourself…"
        />
        {error ? <Banner tone="error">{error}</Banner> : null}
        <Button onClick={handleSave} size="lg" loading={busy}>
          {busy ? 'Saving…' : 'Save bio'}
        </Button>
      </div>
    </Modal>
  );
}

function MyRidesModal({
  rides,
  onClose,
  onDeleted,
}: {
  rides: FeedPostResponse[];
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [error, setError] = useState('');

  const handleDelete = async (post: FeedPostResponse) => {
    if (!window.confirm('Delete this post?')) return;
    setError('');
    try {
      await api.feed.delete(post.id);
      onDeleted();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <Modal title="My rides & posts" onClose={onClose}>
      <div className="flex flex-col gap-3">
        {rides.length === 0 ? (
          <EmptyState title="No posts yet" body="Rides you post will show up here." />
        ) : null}
        {error ? <Banner tone="error">{error}</Banner> : null}
        {rides.map((post) => (
          <div
            key={post.id}
            className="flex items-center gap-3 rounded-2xl border border-line p-3.5 transition-colors hover:bg-cream-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {post.origin} → {post.destination}
              </p>
              <p className="text-xs text-muted">
                {formatDeparture(post.departureTime)}
                {post.postType === 'PASSENGER' ? ' · looking for a ride' : ` · $${post.price}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(post)}
              className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-coral transition-colors hover:border-coral hover:bg-passenger-bg cursor-pointer"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function VehicleModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { data: vehicle, loading } = useApiData(() => api.vehicle.get());
  const [licensePlate, setLicensePlate] = useState<string | null>(null);
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Local edits win; otherwise show what's on file.
  const plateValue = licensePlate ?? vehicle?.licensePlate ?? '';
  const makeValue = make ?? vehicle?.make ?? '';
  const modelValue = model ?? vehicle?.model ?? '';
  const colorValue = color ?? vehicle?.color ?? '';

  const handleSave = async () => {
    if (!plateValue.trim() || !makeValue.trim() || !modelValue.trim() || !colorValue.trim()) {
      setError('Fill in all four fields.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.vehicle.update({
        licensePlate: plateValue.trim(),
        make: makeValue.trim(),
        model: modelValue.trim(),
        color: colorValue.trim(),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal title="Vehicle on file" onClose={onClose}>
      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-12 w-full rounded-2xl" />
          <div className="skeleton h-12 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-2">
            Riders see your vehicle on driver posts. Adding one marks you as a verified driver.
          </p>
          <TextField
            label="License plate"
            value={plateValue}
            onChange={(e) => setLicensePlate(e.target.value)}
          />
          <div className="flex gap-3">
            <TextField label="Make" value={makeValue} onChange={(e) => setMake(e.target.value)} />
            <TextField label="Model" value={modelValue} onChange={(e) => setModel(e.target.value)} />
          </div>
          <TextField label="Color" value={colorValue} onChange={(e) => setColor(e.target.value)} />
          {error ? <Banner tone="error">{error}</Banner> : null}
          <Button onClick={handleSave} size="lg" loading={busy}>
            {busy ? 'Saving…' : 'Save vehicle'}
          </Button>
        </div>
      )}
    </Modal>
  );
}

function BlockedUsersModal({ onClose }: { onClose: () => void }) {
  const { data: blocks, loading, error, reload } = useApiData(() => api.blocks.mine());
  const [actionError, setActionError] = useState('');

  const handleUnblock = async (username: string) => {
    setActionError('');
    try {
      await api.blocks.remove(username);
      void reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  };

  return (
    <Modal title="Blocked users" onClose={onClose}>
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex flex-col gap-2">
            <div className="skeleton h-14 w-full rounded-2xl" />
            <div className="skeleton h-14 w-full rounded-2xl" />
          </div>
        ) : null}
        {error ? <Banner tone="error">{error}</Banner> : null}
        {actionError ? <Banner tone="error">{actionError}</Banner> : null}
        {!loading && (blocks?.length ?? 0) === 0 ? (
          <EmptyState title="No blocked users" body="Users you block will show up here." />
        ) : null}
        {(blocks ?? []).map((block) => (
          <div
            key={block.id}
            className="flex items-center gap-3 rounded-2xl border border-line p-3.5 transition-colors hover:bg-cream-2"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">@{block.blockedUsername}</p>
              {block.reason ? <p className="text-xs text-muted">{block.reason}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => handleUnblock(block.blockedUsername)}
              className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-ink cursor-pointer"
            >
              Unblock
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

