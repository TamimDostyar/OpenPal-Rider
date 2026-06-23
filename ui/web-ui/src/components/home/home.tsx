import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { TabBar, type TabKey } from '@/components/layout/TabBar';
import { FeedTab } from '@/components/home/tabs/FeedTab';
import { BookingsTab } from '@/components/home/tabs/BookingsTab';
import { MessagesTab } from '@/components/home/tabs/MessagesTab';
import { ProfileTab } from '@/components/home/tabs/ProfileTab';

export const MainHome = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col bg-cream">
      <header className="flex items-center justify-between border-b border-line px-5 py-3">
        <Logo />
        <span className="rounded-full bg-cream-2 px-3 py-1 text-xs font-semibold text-sage">
          Preview
        </span>
      </header>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <FeedTab />}
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      <TabBar active={activeTab} onChange={setActiveTab} unreadMessages={2} />
    </div>
  );
};
