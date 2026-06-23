import { MOCK_CONVERSATIONS } from '@/mock/data';

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function MessagesTab() {
  return (
    <div className="flex flex-col">
      <header className="px-5 pb-4 pt-2">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Messages</h1>
      </header>

      <div className="flex flex-col gap-2.5 px-5 pb-8">
        {MOCK_CONVERSATIONS.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            className="flex w-full items-center gap-3 rounded-3xl border border-line bg-cream p-4 text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-2">
              <span className="text-base font-semibold text-ink">
                {conversation.otherName[0]?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-base font-semibold text-ink">{conversation.otherName}</span>
                <span className="shrink-0 text-xs text-muted">
                  {relativeTime(conversation.lastMessageAt)}
                </span>
              </div>
              <p className="truncate text-sm text-ink-2">{conversation.lastMessage}</p>
            </div>
            {conversation.unreadCount > 0 ? (
              <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-coral px-1.5 text-xs font-semibold text-white">
                {conversation.unreadCount}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
