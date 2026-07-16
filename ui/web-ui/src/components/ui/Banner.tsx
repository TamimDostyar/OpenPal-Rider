import type { ReactNode } from 'react';

type BannerTone = 'success' | 'error';

const TONE_CLASSES: Record<BannerTone, string> = {
  success: 'bg-driver-bg text-driver',
  error: 'bg-passenger-bg text-passenger',
};

export function Banner({ tone, children }: { tone: BannerTone; children: ReactNode }) {
  return (
    <p className={`animate-fade-in rounded-xl px-3.5 py-2.5 text-sm font-medium ${TONE_CLASSES[tone]}`}>
      {children}
    </p>
  );
}
