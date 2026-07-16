import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { LogIn } from './auth/page/login';
import { Signup } from './auth/page/signup';
import { ForgotPW } from './auth/page/forgotpw';
import { VerifyEmail } from './auth/page/verify-email';
import { ResetPassword } from './auth/page/reset-password';
import Index from './components/home/index';
import { MainHome } from './components/home/home';
import { session } from './auth/session';

function RequireAuth({ children }: { children: ReactNode }) {
  if (!session.isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
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
