import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
}

export function TextField({
  label,
  hint,
  error,
  trailing,
  type = 'text',
  className = '',
  ...props
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <label className="block w-full">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="relative">
        <input
          type={inputType}
          className={[
            'w-full rounded-2xl border bg-cream px-4 py-3.5 text-sm text-ink outline-none',
            'transition-all duration-150 ease-out placeholder:text-muted',
            error
              ? 'border-coral focus:border-coral focus:ring-4 focus:ring-coral/10'
              : 'border-line focus:border-ink focus:ring-4 focus:ring-ink/5',
            isPassword || trailing ? 'pr-11' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        ) : (
          trailing
        )}
      </div>
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-coral">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
