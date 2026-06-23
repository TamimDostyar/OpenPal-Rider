import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LogIn } from './auth/page/login';
import { Signup } from './auth/page/signup';
import { ForgotPW } from './auth/page/forgotpw';
import { VerifyEmail } from './auth/page/verify-email';
import { ResetPassword } from './auth/page/reset-password';
import Index from './components/home/index';
import { MainHome } from './components/home/home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<MainHome />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPW />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
