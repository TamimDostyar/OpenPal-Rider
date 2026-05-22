/* global React, WelcomeScreen, SignupScreen, VerifyScreen, ProfileSetupScreen, HomeScreen, RideDetailScreen, CreateRideScreen, MessagesScreen, ChatScreen, ProfileScreen, RIDES, THREADS */
// BuddyRide — Interactive prototype state machine

function Prototype({ startAt = 'welcome' }) {
  const [screen, setScreen] = React.useState(startAt);
  const [stack, setStack] = React.useState([]);
  const [openRide, setOpenRide] = React.useState(null);
  const [openThread, setOpenThread] = React.useState(null);
  const [requestedRides, setRequestedRides] = React.useState({});
  const [transitionKey, setTransitionKey] = React.useState(0);

  const go = (s, opts = {}) => {
    setStack(prev => [...prev, screen]);
    setScreen(s);
    setTransitionKey(k => k + 1);
  };
  const back = () => {
    setStack(prev => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const target = next.pop();
      setScreen(target);
      setTransitionKey(k => k + 1);
      return next;
    });
  };
  const tab = (id) => {
    const map = { home: 'home', create: 'create', messages: 'messages', profile: 'profile' };
    setStack([]);
    setScreen(map[id] || 'home');
    setTransitionKey(k => k + 1);
  };

  let view;
  switch (screen) {
    case 'welcome':
      view = <WelcomeScreen onContinue={() => go('signup')} />;
      break;
    case 'signup':
      view = <SignupScreen onBack={back} onSubmit={() => go('verify')} />;
      break;
    case 'verify':
      view = <VerifyScreen onBack={back} onSubmit={() => go('profile-setup')} />;
      break;
    case 'profile-setup':
      view = <ProfileSetupScreen onBack={back} onSubmit={() => { setStack([]); setScreen('home'); }} />;
      break;
    case 'home':
      view = <HomeScreen
        onTab={tab}
        onOpenRide={(r) => { setOpenRide(r); go('ride'); }}
      />;
      break;
    case 'ride':
      view = <RideDetailScreen
        ride={openRide || RIDES[0]}
        requested={!!requestedRides[(openRide||RIDES[0]).id]}
        onBack={back}
        onRequest={() => setRequestedRides(r => ({ ...r, [(openRide||RIDES[0]).id]: true }))}
        onMessage={() => { setOpenThread({ id: 'new', name: (openRide||RIDES[0]).driver, online: true, ride: (openRide||RIDES[0]).to.split(' · ')[0] }); go('chat'); }}
      />;
      break;
    case 'create':
      view = <CreateRideScreen onBack={() => tab('home')} onPost={() => tab('home')} onTab={tab} />;
      break;
    case 'messages':
      view = <MessagesScreen onTab={tab} onOpenChat={(t) => { setOpenThread(t); go('chat'); }} />;
      break;
    case 'chat':
      view = <ChatScreen thread={openThread || THREADS[0]} onBack={back} />;
      break;
    case 'profile':
      view = <ProfileScreen onTab={tab} />;
      break;
    default:
      view = <WelcomeScreen onContinue={() => go('signup')} />;
  }

  return (
    <div key={transitionKey} style={{ width: '100%', height: '100%', animation: 'br-fade 0.28s ease' }}>
      {view}
    </div>
  );
}
window.Prototype = Prototype;
