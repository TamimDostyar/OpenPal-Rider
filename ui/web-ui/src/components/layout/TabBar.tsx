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
    <nav className="flex items-stretch border-t border-line bg-cream px-2 pb-4 pt-2.5">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const showBadge = tab.key === 'messages' && unreadMessages > 0;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="flex flex-1 flex-col items-center gap-1 border-0 bg-transparent p-0 cursor-pointer"
          >
            <span className="relative flex h-7 w-7 items-center justify-center">
              <img
                src={tab.icon}
                alt=""
                aria-hidden
                className={`h-6 w-6 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
              />
              {showBadge ? (
                <span className="absolute -right-3 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-semibold text-white">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              ) : null}
            </span>
            <span className={`text-[12px] font-semibold ${isActive ? 'text-ink' : 'text-muted'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
