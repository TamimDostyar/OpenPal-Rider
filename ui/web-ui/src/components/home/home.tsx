import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { useApiData } from '@/hooks/useApi';
import { session } from '@/auth/session';
import { Logo } from '@/components/ui/Logo';
import { TabBar, type TabKey } from '@/components/layout/TabBar';
import { FeedTab } from '@/components/home/tabs/FeedTab';
import { BookingsTab } from '@/components/home/tabs/BookingsTab';
import { MessagesTab } from '@/components/home/tabs/MessagesTab';
import { ProfileTab } from '@/components/home/tabs/ProfileTab';

export const MainHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!session.isLoggedIn()) navigate('/login', { replace: true });
  }, [navigate]);

  const { data: me, reload: reloadMe } = useApiData(() => api.profile.me());

  const openChat = useCallback((username: string) => {
    setActiveChat(username);
    setActiveTab('messages');
  }, []);

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col bg-cream sm:border-x sm:border-line">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-cream/90 px-5 py-3 backdrop-blur-md">
        <Logo />
        {me ? (
          <span className="flex items-center gap-1.5 rounded-full bg-cream-2 px-3 py-1.5 text-xs font-semibold text-ink-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            @{me.username}
          </span>
        ) : (
          <span className="skeleton h-6 w-20 rounded-full" />
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <FeedTab me={me} onOpenChat={openChat} />}
        {activeTab === 'bookings' && <BookingsTab me={me} onOpenChat={openChat} />}
        {activeTab === 'messages' && (
          <MessagesTab
            me={me}
            activeChat={activeChat}
            onOpenChat={openChat}
            onCloseChat={() => setActiveChat(null)}
            onUnreadChange={setUnreadMessages}
          />
        )}
        {activeTab === 'profile' && <ProfileTab me={me} reloadMe={() => void reloadMe()} />}
      </main>

      <TabBar
        active={activeTab}
        onChange={(tab) => {
          if (tab !== 'messages') setActiveChat(null);
          setActiveTab(tab);
        }}
        unreadMessages={unreadMessages}
      />
    </div>
  );
};
