import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';

export const VerifyEmail = () => {
  return (
    <AuthLayout
      footer={
        <Link to="/signup" className="text-sm font-semibold text-ink no-underline hover:underline">
          ← Back to signup
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-muted">Step 2 of 2 · verify</p>
          <h2 className="text-3xl font-semibold leading-tight text-ink">Check your inbox.</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-2">
            We sent a 4-digit code to{' '}
            <span className="font-semibold text-ink">you@school.edu</span>
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              placeholder="·"
              className="h-14 w-14 rounded-2xl border border-line bg-cream text-center text-2xl font-semibold text-ink outline-none focus:border-ink"
            />
          ))}
        </div>

        <button type="button" className="self-start border-0 bg-transparent p-0 text-sm text-muted">
          Didn&apos;t get it? <span className="font-semibold text-ink">Resend code</span>
        </button>

        <Link to="/login">
          <Button>Verify &amp; create account</Button>
        </Link>
      </div>
    </AuthLayout>
  );
};
