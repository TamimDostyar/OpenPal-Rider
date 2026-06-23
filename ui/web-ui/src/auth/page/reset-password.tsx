import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '../access';

export const ResetPassword = () => {
  const { password, setPassword, error, handleResetPW, code, setCode } = useAuth();
  
  return (
    <AuthLayout
      footer={
        <Link to="/login" className="text-sm font-semibold text-ink no-underline hover:underline">
          ← Back to sign in
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-semibold leading-tight text-ink">Choose a new password.</h2>

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <TextField
            label="Reset token"
            placeholder="Paste your reset token"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <TextField
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="pt-2">
            <Button onClick={handleResetPW}>Reset password</Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
