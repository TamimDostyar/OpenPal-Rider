const TOKEN_KEY = 'token';
const PENDING_EMAIL_KEY = 'pendingEmail';

export const session = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
  isLoggedIn(): boolean {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },

  // Email awaiting verification during signup, so /verify-email survives a refresh.
  getPendingEmail(): string | null {
    return sessionStorage.getItem(PENDING_EMAIL_KEY);
  },
  setPendingEmail(email: string) {
    sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  },
  clearPendingEmail() {
    sessionStorage.removeItem(PENDING_EMAIL_KEY);
  },
};
