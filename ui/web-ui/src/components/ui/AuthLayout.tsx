import type { ReactNode } from 'react';
import { hero } from '@/assets';
import { Logo } from './Logo';

interface AuthLayoutProps {
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="auth-split-left flex flex-1 items-center justify-center bg-canvas px-8">
        <img
          src={hero}
          alt="Students sharing rides between campuses"
          className="max-h-[420px] w-full max-w-[440px] object-contain"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center px-6 py-10 sm:px-10">
          <div className="mb-10 flex justify-center">
            <Logo />
          </div>

          <div className="flex-1">{children}</div>

          {footer ? <div className="mt-8 text-center">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
