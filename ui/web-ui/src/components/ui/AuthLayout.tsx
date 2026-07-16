import type { ReactNode } from 'react';
import { Logo } from './Logo';
import { AuthRoutePath } from './AuthRoutePath';

interface AuthLayoutProps {
  children: ReactNode;
  footer?: ReactNode;
}

const STATS = [
  { value: '4.9', label: 'avg. rating' },
  { value: '12k+', label: 'rides shared' },
  { value: '100%', label: '.edu verified' },
];

export function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="auth-split-left relative flex flex-1 flex-col overflow-hidden bg-ink px-12 py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(rgb(var(--c-cream)) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-coral/20 blur-3xl"
        />

        <Logo tone="light" />

        <div className="relative z-10 flex flex-1 flex-col justify-center gap-10 py-12">
          <div className="max-w-sm">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-cream/70">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" />
              students only
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-cream">
              Your ride to campus is already here.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-cream/60">
              PalRiders matches you with verified students headed the same
              way — no strangers, no surge pricing.
            </p>
          </div>

          <AuthRoutePath />
        </div>

        <div className="relative z-10 flex items-center gap-6">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-6">
              {i > 0 ? <span className="h-8 w-px bg-cream/10" /> : null}
              <div>
                <p className="text-lg font-bold text-cream">{stat.value}</p>
                <p className="text-xs text-cream/50">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-cream">
        <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center px-6 py-10 sm:px-10">
          <div className="mb-10 flex justify-center lg:hidden">
            <Logo />
          </div>

          <div className="animate-fade-up flex-1">{children}</div>

          {footer ? <div className="mt-8 text-center">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
