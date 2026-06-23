import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

export const ResetPassword = () => {
  return (
    <AuthLayout
      footer={
        <Link to="/login" className="text-sm font-semibold text-ink no-underline hover:underline">
          ← Back to sign in
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-semibold leading-tight text-ink">Choose a new password.</h2>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <TextField
            label="Reset token"
            placeholder="Paste your reset token"
          />
          <TextField
            label="New password"
            type="password"
            placeholder="At least 8 characters"
          />

          <div className="pt-2">
            <Link to="/login">
              <Button>Reset password</Button>
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
