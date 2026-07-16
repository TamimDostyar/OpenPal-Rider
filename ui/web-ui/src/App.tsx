import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import { LogIn } from './auth/page/login';
import { Signup } from './auth/page/signup';
import { ForgotPW } from './auth/page/forgotpw';
import { VerifyEmail } from './auth/page/verify-email';
import { ResetPassword } from './auth/page/reset-password';
import Index from './components/home/index';
import { MainHome } from './components/home/home';
import { session, AUTH_EXPIRED_EVENT } from './auth/session';

function RequireAuth({ children }: { children: ReactNode }) {
  if (!session.isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

function AuthExpiryWatcher() {
  const navigate = useNavigate();

  useEffect(() => {
    const onExpired = () => navigate('/login', { replace: true });
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthExpiryWatcher />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <MainHome />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPW />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
