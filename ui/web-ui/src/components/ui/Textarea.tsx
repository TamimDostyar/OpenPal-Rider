import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <label className="block w-full">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <textarea
        className={[
          'w-full resize-none rounded-2xl border border-line bg-cream px-4 py-3.5 text-sm text-ink outline-none',
          'transition-all duration-150 ease-out placeholder:text-muted focus:border-ink focus:ring-4 focus:ring-ink/5',
          className,
        ].join(' ')}
        {...props}
      />
    </label>
  );
}
