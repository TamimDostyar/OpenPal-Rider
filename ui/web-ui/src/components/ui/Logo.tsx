import { Link } from 'react-router-dom';
import { logoMark, appIcon } from '@/assets';

interface LogoProps {
  tone?: 'ink' | 'light';
  variant?: 'mark' | 'app';
  className?: string;
  showWordmark?: boolean;
}

export function Logo({
  tone = 'ink',
  variant = 'mark',
  className = '',
  showWordmark = true,
}: LogoProps) {
  const src = variant === 'app' ? appIcon : logoMark;
  const imgClass = variant === 'app' ? 'h-9 w-9 rounded-xl object-cover' : 'h-7 w-11';

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 no-underline ${className}`}>
      <img src={src} alt="OpenPal" className={imgClass} />
      {showWordmark ? (
        <span className={`text-xl font-semibold tracking-tight ${tone === 'ink' ? 'text-ink' : 'text-cream'}`}>
          OpenPal
        </span>
      ) : null}
    </Link>
  );
}
