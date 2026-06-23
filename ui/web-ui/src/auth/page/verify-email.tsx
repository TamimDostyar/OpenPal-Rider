import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { useAuth } from '../access';

export const VerifyEmail = () => {
  const { email, code, setCode, error, handleResetPW } = useAuth();

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
            We sent a 4-digit code to <span className="font-semibold text-ink">{email}</span>
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <input
              key={i}
              value={code[i] || ''}
              onChange={(e) => {
                const next = code.split('');
                next[i] = e.target.value;
                setCode(next.join(''));
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              placeholder="·"
              className="h-14 w-14 rounded-2xl border border-line bg-cream text-center text-2xl font-semibold text-ink outline-none focus:border-ink"
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="button" className="self-start border-0 bg-transparent p-0 text-sm text-muted">
          Didn&apos;t get it? <span className="font-semibold text-ink">Resend code</span>
        </button>

        <button
          onClick={handleResetPW}
          className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Verify
        </button>
      </div>
    </AuthLayout>
  );
};