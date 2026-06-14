# OpenPal Rider — Mobile

BuddyRide mobile app (Expo + React Native + TypeScript + NativeWind).

This app implements the **auth and onboarding flow** only — the OpenPal Rider
backend currently exposes auth endpoints and a universities list, and nothing
else is built until matching backend routes exist.

## Stack

- Expo (React Native) + TypeScript
- NativeWind — Tailwind classes for React Native
- React Navigation — native stack
- expo-secure-store — persists the JWT

## Running

```bash
npm install
npm start
```

Then open the app in the Expo Go client or an emulator.

The backend base URL is set in [src/api/client.ts](src/api/client.ts).
It defaults to `http://localhost:8000` (`http://10.0.2.2:8000` on Android
emulators). Point it at a deployed URL when testing on a physical device.

## Project layout

The codebase keeps UI and logic strictly separated:

| Folder            | Holds                                                    |
| ----------------- | -------------------------------------------------------- |
| `src/screens`     | Screen UI only — each screen calls one hook and renders. |
| `src/hooks`       | All screen logic — state, validation, navigation, API.   |
| `src/components`  | Reusable presentational components.                      |
| `src/api`         | `client.ts` is the single file that talks to the backend.|
| `src/auth`        | JWT storage / auth context.                              |
| `src/navigation`  | Navigation stack and route types.                        |

## Implemented flows

| Screen           | Backend endpoint(s)                          |
| ---------------- | -------------------------------------------- |
| Welcome          | —                                            |
| Signup           | `POST /api/user/create-user`, `GET /api/universities` |
| Verify email     | `POST /api/user/verify-email`, `POST /api/user/resend-code` |
| Login            | `POST /login-user`                           |
| Forgot password  | `POST /forgot-password`                      |
| Reset password   | `POST /reset-password`                       |
| Home             | `GET /api/` (health check)                   |
