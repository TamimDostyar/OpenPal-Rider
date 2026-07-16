import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/api/client';
import type { DirectMessageResponse, MyProfile } from '@/api/types';
import { errorMessage, useApiData } from '@/hooks/useApi';
import { formatTime, initialsOf, relativeTime } from '@/lib/format';
import { EmptyState } from '@/components/ui/EmptyState';
import { tabMessages } from '@/assets';

interface MessagesTabProps {
  me: MyProfile | null;
  activeChatUsername: string | null;
  activeChatName?: string | null;
  onOpenChat: (username: string, name?: string | null) => void;
  onCloseChat: () => void;
  onUnreadChange?: (count: number) => void;
}

export function MessagesTab({
  me,
  activeChatUsername,
  activeChatName,
  onOpenChat,
  onCloseChat,
  onUnreadChange,
}: MessagesTabProps) {
  if (activeChatUsername) {
    return (
      <ChatThread
        me={me}
        otherUsername={activeChatUsername}
        initialOtherName={activeChatName}
        onBack={onCloseChat}
      />
    );
  }
  return <ConversationList onOpenChat={onOpenChat} onUnreadChange={onUnreadChange} />;
}

function ConversationSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-3xl border border-line bg-cream p-4">
          <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1">
            <div className="skeleton mb-2 h-3.5 w-1/3 rounded-full" />
            <div className="skeleton h-3 w-2/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConversationList({
  onOpenChat,
  onUnreadChange,
}: {
  onOpenChat: (username: string, name?: string | null) => void;
  onUnreadChange?: (count: number) => void;
}) {
  const { data: conversations, loading, error } = useApiData(() => api.messages.conversations());

  useEffect(() => {
    if (conversations) {
      onUnreadChange?.(conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
    }
  }, [conversations, onUnreadChange]);

  return (
    <div className="flex flex-col">
      <header className="px-5 pb-5 pt-4">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-ink sm:text-3xl">Messages</h1>
      </header>

      <div className="flex flex-col gap-2.5 px-5 pb-8">
        {loading ? <ConversationSkeleton /> : null}
        {error ? <EmptyState title="Couldn't load messages" body={error} /> : null}
        {!loading && !error && (conversations?.length ?? 0) === 0 ? (
          <EmptyState
            icon={tabMessages}
            title="No conversations yet"
            body="Message a driver or rider from the feed to start a chat."
          />
        ) : null}

        {(conversations ?? []).map((conversation, i) => {
          const displayName = conversation.otherName || conversation.otherUsername;
          const hasUnread = conversation.unreadCount > 0;
          return (
            <button
              key={conversation.otherUsername}
              type="button"
              onClick={() => onOpenChat(conversation.otherUsername, conversation.otherName)}
              className="animate-fade-up flex w-full items-center gap-3 rounded-3xl border border-line bg-cream p-4 text-left shadow-[var(--shadow-xs)] transition-all duration-150 ease-out hover:shadow-[var(--shadow-sm)] active:scale-[0.99] cursor-pointer"
              style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cream-2 to-line/60 ring-1 ring-line">
                <span className="text-base font-bold text-ink">{initialsOf(displayName)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[15px] font-semibold text-ink">{displayName}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {relativeTime(conversation.lastMessage?.createdAt)}
                  </span>
                </div>
                <p className={`truncate text-sm ${hasUnread ? 'font-semibold text-ink' : 'text-ink-2'}`}>
                  {conversation.lastMessage?.text}
                </p>
              </div>
              {hasUnread ? (
                <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-coral px-1.5 text-xs font-semibold text-white">
                  {conversation.unreadCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Pulls the other person's display name off whichever message mentions them, once the thread loads. */
function nameFromMessages(messages: DirectMessageResponse[] | null, otherUsername: string): string | null {
  const found = messages?.find(
    (m) => m.senderUsername === otherUsername || m.recipientUsername === otherUsername,
  );
  if (!found) return null;
  return found.senderUsername === otherUsername ? found.senderName : found.recipientName;
}

function ChatThread({
  me,
  otherUsername,
  initialOtherName,
  onBack,
}: {
  me: MyProfile | null;
  otherUsername: string;
  initialOtherName?: string | null;
  onBack: () => void;
}) {
  const { data: messages, loading, error, reload } = useApiData(
    () => api.messages.with(otherUsername),
    [otherUsername],
  );
  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(
    () => initialOtherName || nameFromMessages(messages, otherUsername) || otherUsername,
    [initialOtherName, messages, otherUsername],
  );

  // Light polling keeps the thread reasonably fresh without websockets.
  useEffect(() => {
    const id = window.setInterval(() => void reload(), 15000);
    return () => window.clearInterval(id);
  }, [reload]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setBusy(true);
    setSendError('');
    try {
      await api.messages.send({ recipientUsername: otherUsername, text });
      setDraft('');
      await reload();
    } catch (err) {
      setSendError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-cream/90 px-5 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-2 text-base text-ink transition-colors hover:bg-line-2 cursor-pointer"
        >
          ←
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cream-2 to-line/60 ring-1 ring-line">
          <span className="text-sm font-bold text-ink">{initialsOf(displayName)}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{displayName}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading && !messages ? (
          <div className="flex flex-col gap-2">
            <div className="skeleton ml-auto h-9 w-2/5 rounded-3xl" />
            <div className="skeleton h-9 w-1/2 rounded-3xl" />
            <div className="skeleton ml-auto h-9 w-1/3 rounded-3xl" />
          </div>
        ) : null}
        {error ? <EmptyState title="Couldn't load messages" body={error} /> : null}
        {!loading && !error && (messages?.length ?? 0) === 0 ? (
          <EmptyState title="Say hello" body={`Start the conversation with ${displayName}.`} />
        ) : null}

        <div className="flex flex-col gap-2">
          {(messages ?? []).map((message) => {
            const isMine = message.senderUsername === me?.username;
            return (
              <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-3xl px-4 py-2.5 shadow-[var(--shadow-xs)] ${
                    isMine ? 'rounded-br-lg bg-ink text-cream' : 'rounded-bl-lg bg-cream-2 text-ink'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-5">{message.text}</p>
                  <p className={`mt-1 text-right text-[10px] ${isMine ? 'text-cream/60' : 'text-muted'}`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {sendError ? <p className="px-5 pb-1 text-sm font-medium text-coral">{sendError}</p> : null}

      <div className="flex items-center gap-2 border-t border-line bg-cream px-5 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder={`Message ${displayName}`}
          className="flex-1 rounded-full border border-line bg-cream-2 px-4 py-2.5 text-sm text-ink outline-none transition-all duration-150 ease-out placeholder:text-muted focus:border-ink focus:bg-cream focus:ring-4 focus:ring-ink/5"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={busy || !draft.trim()}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream shadow-[var(--shadow-xs)] transition-all duration-150 ease-out hover:shadow-[var(--shadow-sm)] active:scale-95 disabled:opacity-40 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
