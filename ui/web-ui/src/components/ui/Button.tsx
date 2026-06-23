import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'ink' | 'coral' | 'ghost' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  ink: 'bg-ink text-cream hover:bg-ink-2 border border-ink',
  coral: 'bg-coral text-cream hover:bg-coral-dk border border-coral',
  ghost: 'bg-transparent text-ink hover:bg-cream-2 border border-transparent',
  outline: 'bg-cream text-ink hover:bg-cream-2 border border-line',
};

export function Button({
  variant = 'ink',
  children,
  fullWidth = true,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : '',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
