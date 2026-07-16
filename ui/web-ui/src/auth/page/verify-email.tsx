import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { errorMessage } from '@/hooks/useApi';
import { session } from '@/auth/session';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';

const CODE_LENGTH = 4;

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const email = session.getPendingEmail() ?? '';
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigit = (i: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (clean && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (!email) {
      setError('No signup in progress — start again from the signup page.');
      return;
    }
    if (code.length !== CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit code.`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.verifyEmail({ email, code });
      session.clearPendingEmail();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('No signup in progress — start again from the signup page.');
      return;
    }
    setError('');
    try {
      const res = await api.resendCode(email);
      setNotice(res.message || 'A new code is on its way.');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <AuthLayout
      footer={
        <Link to="/signup" className="text-sm font-semibold text-ink no-underline hover:underline">
          ← Back to signup
        </Link>
      }
    >
      <div className="flex flex-col gap-7">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-coral">
            Step 2 of 2 · verify
          </p>
          <h2 className="text-[2rem] font-bold leading-tight tracking-tight text-ink">
            Check your inbox.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            We sent a {CODE_LENGTH}-digit code to{' '}
            <span className="font-semibold text-ink">{email || 'your email'}</span>
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={digit}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              placeholder="·"
              className={[
                'h-14 w-14 rounded-2xl border bg-cream text-center text-2xl font-semibold text-ink outline-none',
                'transition-all duration-150 ease-out focus:ring-4 focus:ring-ink/5',
                digit ? 'border-ink' : 'border-line focus:border-ink',
              ].join(' ')}
            />
          ))}
        </div>

        {error ? (
          <p className="animate-fade-in rounded-xl bg-passenger-bg px-3.5 py-2.5 text-center text-sm font-medium text-passenger">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="animate-fade-in rounded-xl bg-driver-bg px-3.5 py-2.5 text-center text-sm font-medium text-driver">
            {notice}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleResend}
          className="self-start border-0 bg-transparent p-0 text-sm text-muted cursor-pointer transition-colors hover:text-ink"
        >
          Didn&apos;t get it? <span className="font-semibold text-ink underline">Resend code</span>
        </button>

        <Button onClick={handleVerify} size="lg" loading={busy}>
          {busy ? 'Verifying…' : 'Verify'}
        </Button>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
