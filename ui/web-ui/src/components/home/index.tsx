import { Link } from 'react-router-dom';
import { iconCar, iconCampus, tabMessages } from '@/assets';
import { Logo } from '@/components/ui/Logo';
import { RouteMap } from '@/components/ui/RouteMap';
import { Button } from '@/components/ui/Button';

const TRUST_BADGES = ['Verified .edu email', 'Real names', 'Real reviews'];

const FEATURES = [
  {
    icon: iconCar,
    title: 'Post a ride in seconds',
    body: "Heading to the airport, home for break, or just across town? Offer your empty seats or ask for a lift — no back-and-forth required.",
  },
  {
    icon: iconCampus,
    title: 'Only your campus',
    body: 'Every rider verifies with a real .edu email, so you\'re always riding with people from your own school.',
  },
  {
    icon: tabMessages,
    title: 'Chat, book, go',
    body: 'Message your driver or rider directly, confirm the details, and track the whole trip from request to ride complete.',
  },
];

const STEPS = [
  { n: '01', title: 'Verify your .edu email', body: 'Sign up with your campus email so your community knows it\'s really you.' },
  { n: '02', title: 'Post or browse rides', body: 'Offer a seat you have spare, or find someone already heading your way.' },
  { n: '03', title: 'Ride with confidence', body: 'Chat first, confirm the trip, then rate each other once you\'re there.' },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link to="/login">
              <Button variant="ghost" fullWidth={false} className="px-4 py-2.5 text-sm">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="ink" fullWidth={false} className="px-4 py-2.5 text-sm">
                Get started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(220,38,38,0.08),transparent_70%)]"
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up flex flex-col gap-7">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-cream-2 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" />
              students only
            </span>

            <h1 className="text-[2.75rem] font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Ride with people from{' '}
              <span className="text-coral">your own campus.</span>
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-ink-2">
              PalRiders connects verified students headed the same way — to the
              airport, home for break, or across town. No strangers, no surge
              pricing, just your school community.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/signup" className="sm:w-auto">
                <Button variant="ink" size="lg" fullWidth={false} className="w-full sm:w-auto sm:px-10">
                  Create your account
                </Button>
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center py-2 text-center text-sm font-semibold text-ink no-underline sm:justify-start"
              >
                Already have an account? <span className="ml-1 underline">Sign in</span>
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
              {TRUST_BADGES.map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-sm text-muted">
                  <svg className="h-4 w-4 shrink-0 text-sage" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <div className="mx-auto max-w-md rounded-[2rem] border border-line bg-cream p-2 shadow-[var(--shadow-xl)]">
              <div className="rounded-[1.6rem] bg-canvas p-5 sm:p-6">
                <RouteMap />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-cream-2/60">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
          <div className="mb-12 max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sage">Why PalRiders</p>
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Built for how students actually get around.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group flex flex-col gap-4 rounded-3xl border border-line bg-cream p-6 shadow-[var(--shadow-sm)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink/5 transition-colors group-hover:bg-coral/10">
                  <img src={feature.icon} alt="" aria-hidden className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-ink">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-ink-2">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="mb-12 max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-coral">How it works</p>
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            From sign-up to seatbelt in three steps.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="flex flex-col gap-3">
              <span className="text-sm font-bold text-line-2 [-webkit-text-stroke:1px_rgb(var(--c-muted))] text-transparent">
                {step.n}
              </span>
              <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ink-2">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-6 mb-16 overflow-hidden rounded-[2rem] bg-ink sm:mx-8 sm:mb-24">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-20">
          <h2 className="max-w-xl text-3xl font-bold tracking-tight text-cream sm:text-4xl">
            Your campus is smaller than you think.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-cream/70">
            Join the students already sharing rides on PalRiders — sign up takes
            less than two minutes.
          </p>
          <Link to="/signup">
            <Button variant="coral" size="lg" fullWidth={false} className="px-10">
              Get started free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
          <Logo />
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} OpenPal · Verified .edu · real names · real reviews
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
