import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'ink' | 'coral' | 'ghost' | 'outline';
type ButtonSize = 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  ink: 'bg-ink text-cream border border-ink shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:bg-ink-2',
  coral:
    'bg-coral text-cream border border-coral shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:bg-coral-dk',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-cream-2',
  outline: 'bg-cream text-ink border border-line hover:border-ink hover:bg-cream-2',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-6 py-3.5 text-sm',
  lg: 'px-7 py-4 text-base',
};

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function Button({
  variant = 'ink',
  size = 'md',
  children,
  fullWidth = true,
  loading = false,
  className = '',
  type = 'button',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        'relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight',
        'transition-all duration-150 ease-out cursor-pointer select-none',
        'active:scale-[0.97]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none',
        fullWidth ? 'w-full' : '',
        sizeClasses[size],
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? <Spinner /> : null}
      <span className={loading ? 'opacity-90' : ''}>{children}</span>
    </button>
  );
}
