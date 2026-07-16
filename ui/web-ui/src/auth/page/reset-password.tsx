import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { errorMessage } from '@/hooks/useApi';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const handleReset = async () => {
    if (!token.trim() || !password) {
      setError('Enter your reset token and a new password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await api.resetPassword({ token: token.trim(), newPassword: password });
      setMessage(response.message || 'Password updated. You can sign in now.');
      setTimeout(() => navigate('/login'), 1200);
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
        <h2 className="text-[2rem] font-bold leading-tight tracking-tight text-ink">
          Choose a new password.
        </h2>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleReset();
          }}
          noValidate
        >
          <TextField
            label="Reset token"
            placeholder="Paste your reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <TextField
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
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
          <div className="pt-2">
            <Button type="submit" size="lg" loading={busy}>
              {busy ? 'Saving…' : 'Reset password'}
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
