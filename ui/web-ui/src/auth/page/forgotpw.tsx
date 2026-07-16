import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { errorMessage } from '@/hooks/useApi';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

export const ForgotPW = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const handleForget = async () => {
    if (!email.trim()) {
      setError('Enter your email.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await api.forgotPassword(email.trim());
      setMessage(response.message || 'Check your email for a reset token.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      footer={
        <Link to="/login" className="text-sm font-semibold text-ink no-underline hover:underline">
          ← Back to sign in
        </Link>
      }
    >
      <div className="flex flex-col gap-7">
        <div>
          <h2 className="text-[2rem] font-bold leading-tight tracking-tight text-ink">
            Reset your password.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            Enter your email and we&apos;ll issue a one-time reset token.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          {error ? (
            <p className="animate-fade-in rounded-xl bg-passenger-bg px-3.5 py-2.5 text-sm font-medium text-passenger">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="animate-fade-in rounded-xl bg-driver-bg px-3.5 py-2.5 text-sm font-medium text-driver">
              {message}
            </p>
          ) : null}

          <Button onClick={handleForget} size="lg" loading={busy}>
            {busy ? 'Sending…' : 'Get a code'}
          </Button>

          {message ? (
            <Link
              to="/reset-password"
              className="text-center text-sm font-semibold text-ink underline"
            >
              I have a token — reset my password
            </Link>
          ) : null}
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPW;
