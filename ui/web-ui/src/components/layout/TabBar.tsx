import { tabFeed, tabBookings, tabMessages, tabProfile } from '@/assets';

export type TabKey = 'home' | 'bookings' | 'messages' | 'profile';

interface TabBarProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  unreadMessages?: number;
}

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'home', label: 'Feed', icon: tabFeed },
  { key: 'bookings', label: 'Bookings', icon: tabBookings },
  { key: 'messages', label: 'Messages', icon: tabMessages },
  { key: 'profile', label: 'Profile', icon: tabProfile },
];

export function TabBar({ active, onChange, unreadMessages = 0 }: TabBarProps) {
  return (
    <nav className="flex items-stretch gap-1 border-t border-line bg-cream/90 px-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const showBadge = tab.key === 'messages' && unreadMessages > 0;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            aria-current={isActive ? 'page' : undefined}
            className="group flex flex-1 flex-col items-center gap-1 rounded-2xl border-0 bg-transparent py-1.5 cursor-pointer transition-transform duration-150 ease-out active:scale-95"
          >
            <span
              className={[
                'relative flex h-8 w-11 items-center justify-center rounded-full transition-colors duration-200 ease-out',
                isActive ? 'bg-ink/8' : 'group-hover:bg-ink/5',
              ].join(' ')}
            >
              <img
                src={tab.icon}
                alt=""
                aria-hidden
                className={`h-5 w-5 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-45'}`}
              />
              {showBadge ? (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-semibold text-white ring-2 ring-cream">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              ) : null}
            </span>
            <span
              className={`text-[11px] font-semibold transition-colors duration-200 ${isActive ? 'text-ink' : 'text-muted'}`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
