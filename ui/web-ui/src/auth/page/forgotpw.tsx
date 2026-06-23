import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { useAuth } from '../access';

export const ForgotPW = () => {
  const { email, setEmail, error, message, handleForget } = useAuth();
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

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        <button
          onClick={handleForget}
          className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Get a code
        </button>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        {message && (
          <Link
            to="/verify-email"
            className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-center"
          >
            I have a token
          </Link>
        )}
      </div>
    </AuthLayout>
  );
};