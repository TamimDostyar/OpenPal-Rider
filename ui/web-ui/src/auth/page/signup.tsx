import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

export const Signup = () => {
  return (
    <AuthLayout
      footer={
        <p className="text-[15px] text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink no-underline hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-muted">Step 1 of 2 · your details</p>
          <h2 className="text-3xl font-semibold leading-tight text-ink">Create your account.</h2>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <TextField label="Full name" placeholder="Tamim Dostyar" />
          <TextField
            label="Campus email"
            type="email"
            placeholder="you@school.edu"
          />
          <TextField
            label="School"
            placeholder="Search your university…"
            hint="Pick from the list, or add a school not listed."
          />
          <TextField
            label="Graduation date"
            placeholder="MM/DD/YYYY"
            hint="Example: 05/01/2026"
          />
          <TextField
            label="Phone number"
            placeholder="10-digit number"
          />
          <TextField
            label="Password"
            type="password"
            placeholder="At least 8 characters"
          />

          <div className="flex flex-col gap-3 pt-2">
            <Link to="/verify-email">
              <Button variant="coral">Send verification code</Button>
            </Link>
            <p className="text-center text-xs leading-5 text-muted">
              By creating an account, you agree to our{' '}
              <span className="font-semibold text-ink underline">Terms &amp; Conditions</span> and{' '}
              <span className="font-semibold text-ink underline">Privacy Policy</span>.
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
