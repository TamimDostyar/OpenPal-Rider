import { Link } from 'react-router-dom';
import { useAuth } from '../access';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

export const LogIn = () => {
  const navigate = useNavigate();
  const { email, setEmail, password, setPassword, handleLogin, error, handleForget} = useAuth();
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-ink">Welcome back!</h2>
          <p className="mt-2 text-base text-muted">Please enter your details</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.edu"
          />

          <label className="block w-full">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Password
            </span>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                className="w-full rounded-2xl border border-line bg-cream px-4 py-3.5 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-ink">
              <input type="checkbox" className="h-4 w-4 rounded border-line accent-ink" />
              Remember for 30 days
            </label>
            <Link to="/forgot-password" className="text-[13px] font-semibold text-coral-dk no-underline hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="button"
            onClick={() => handleLogin().then((ok) => { if (ok) navigate('/home'); })}
          >
            Log In
          </Button>

          {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
        </form>

        <p className="text-center text-xs leading-5 text-muted">
          By continuing, you agree to our{' '}
          <span className="cursor-pointer font-semibold text-ink underline">Terms &amp; Conditions</span>{' '}
          and{' '}
          <span className="cursor-pointer font-semibold text-ink underline">Privacy Policy</span>.
        </p>
      </div>
    </AuthLayout>
  );
};

export default LogIn;
