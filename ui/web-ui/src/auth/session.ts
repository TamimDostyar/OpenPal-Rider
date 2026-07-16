const TOKEN_KEY = 'token';
const PENDING_EMAIL_KEY = 'pendingEmail';

// Fired whenever the token is cleared because the backend rejected it
// (expired/invalid), so the app can react by returning to /login instead of
// leaving the user stuck on a broken authenticated screen.
export const AUTH_EXPIRED_EVENT = 'openpal:auth-expired';

export const session = {
  // localStorage (not sessionStorage) so login survives closing the tab or
  // the whole browser — the token is only ever removed by an explicit sign
  // out, account deletion, or the backend rejecting it as invalid/expired.
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

  /** Call when the backend reports the token is no longer valid. */
  expire() {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
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
