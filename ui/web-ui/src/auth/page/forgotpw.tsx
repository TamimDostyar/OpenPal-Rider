import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

export const ForgotPW = () => {
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
          <h2 className="text-3xl font-semibold leading-tight text-ink">Reset your password.</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-2">
            Enter your email and we&apos;ll issue a one-time reset token.
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <TextField
            label="Email"
            type="email"
            placeholder="you@school.edu"
          />

          <div className="flex flex-col gap-3 pt-2">
            <Button>Send reset token</Button>
            <Link to="/reset-password">
              <Button variant="ghost">I have a token</Button>
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
