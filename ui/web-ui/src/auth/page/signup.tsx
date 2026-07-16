import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { errorMessage, useApiData } from '@/hooks/useApi';
import { session } from '@/auth/session';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { LegalModal, type LegalKind } from '@/components/legal/LegalModal';

export const Signup = () => {
  const navigate = useNavigate();
  const { data: universities } = useApiData(() => api.universities());
  const [legalOpen, setLegalOpen] = useState<LegalKind | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [graduationDate, setGraduationDate] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const phoneDigits = phone.replace(/\D/g, '');
    if (!name.trim() || !email.trim() || !school.trim() || !password) {
      setError('Please fill in every field.');
      return;
    }
    if (phoneDigits.length !== 10) {
      setError('Phone number must be 10 digits.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await api.createUser({
        name: name.trim(),
        email: email.trim(),
        school: school.trim(),
        graduationDate: graduationDate || null,
        phoneNumber: Number(phoneDigits),
        password,
      });
      session.setPendingEmail(email.trim());
      navigate('/verify-email');
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
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink no-underline hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-7">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-coral">
            Step 1 of 2 · your details
          </p>
          <h2 className="text-[2rem] font-bold leading-tight tracking-tight text-ink">
            Create your account.
          </h2>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Full name"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <TextField
            label="Campus email"
            type="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <TextField
            label="School"
            placeholder="Search your university…"
            hint="Pick from the list, or type a school not listed."
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            list="universities-list"
          />
          <datalist id="universities-list">
            {(universities?.universities ?? []).map((u) => (
              <option key={u.name} value={u.name} />
            ))}
          </datalist>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Graduation date"
              type="date"
              value={graduationDate}
              onChange={(e) => setGraduationDate(e.target.value)}
            />
            <TextField
              label="Phone number"
              type="tel"
              placeholder="10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <TextField
            label="Password"
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

          <div className="flex flex-col gap-3 pt-2">
            <Button variant="coral" size="lg" type="submit" loading={busy}>
              {busy ? 'Sending code…' : 'Send verification code'}
            </Button>
            <p className="text-center text-xs leading-5 text-muted">
              By creating an account, you agree to our{' '}
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
        </form>
      </div>

      {legalOpen ? <LegalModal kind={legalOpen} onClose={() => setLegalOpen(null)} /> : null}
    </AuthLayout>
  );
};

export default Signup;
