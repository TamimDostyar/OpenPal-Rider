import { Link } from 'react-router-dom';
import { appIcon } from '@/assets';
import { Logo } from '@/components/ui/Logo';
import { RouteMap } from '@/components/ui/RouteMap';
import { Button } from '@/components/ui/Button';

const Index = () => {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-between px-6 py-8 sm:px-8">
      <Logo />

      <div className="flex flex-col gap-7 py-8">
        <div className="flex items-start gap-4">
          <img
            src={appIcon}
            alt="PalRiders app icon"
            className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-sm"
          />
          <div>
            <p className="mb-3 text-xs uppercase tracking-widest text-muted">·001 · students only</p>
            <h1 className="text-4xl font-semibold leading-tight text-ink">
              Student community — get a ride from your school friends!
            </h1>
          </div>
        </div>

        <RouteMap />

        <div className="flex flex-col gap-3">
          <Link to="/login">
            <Button variant="ink">Sign in</Button>
          </Link>
          <Link to="/signup" className="block py-2 text-center text-sm text-muted no-underline">
            New here? <span className="font-semibold text-ink">Create an account</span>
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-muted">Verified .edu · real names · real reviews</p>
    </div>
  );
};

export default Index;
