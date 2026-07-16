import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { errorMessage } from '@/hooks/useApi';
import { session } from '@/auth/session';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { LegalModal, type LegalKind } from '@/components/legal/LegalModal';

export const LogIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [legalOpen, setLegalOpen] = useState<LegalKind | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { token } = await api.login({ email: email.trim(), password });
      session.setToken(token);
      navigate('/home');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      footer={
        <p className="text-[15px] text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-ink no-underline hover:underline">
            Sign Up
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-7">
        <div>
          <h2 className="text-[2rem] font-bold leading-tight tracking-tight text-ink">Welcome back.</h2>
          <p className="mt-2 text-[15px] text-muted">Sign in to see what&apos;s moving on campus.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.edu"
            autoComplete="email"
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
          />

          <div className="flex items-center justify-end -mt-1">
            <Link
              to="/forgot-password"
              className="text-[13px] font-semibold text-coral-dk no-underline hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {error ? (
            <p className="animate-fade-in rounded-xl bg-passenger-bg px-3.5 py-2.5 text-sm font-medium text-passenger">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" loading={busy} className="mt-1">
            {busy ? 'Logging in…' : 'Log In'}
          </Button>
        </form>

        <p className="text-center text-xs leading-5 text-muted">
          By continuing, you agree to our{' '}
          <button
            type="button"
            onClick={() => setLegalOpen('terms')}
            className="border-0 bg-transparent p-0 font-semibold text-ink underline cursor-pointer"
          >
            Terms &amp; Conditions
          </button>{' '}
          and{' '}
          <button
            type="button"
            onClick={() => setLegalOpen('privacy')}
            className="border-0 bg-transparent p-0 font-semibold text-ink underline cursor-pointer"
          >
            Privacy Policy
          </button>
          .
        </p>
      </div>

      {legalOpen ? <LegalModal kind={legalOpen} onClose={() => setLegalOpen(null)} /> : null}
    </AuthLayout>
  );
};

export default LogIn;
