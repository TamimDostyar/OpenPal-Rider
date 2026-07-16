import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line px-6 py-14 text-center">
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-2">
          <img src={icon} alt="" aria-hidden className="h-5 w-5 opacity-60" />
        </div>
      ) : null}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {body ? <p className="max-w-xs text-sm text-muted">{body}</p> : null}
      {action}
    </div>
  );
}
