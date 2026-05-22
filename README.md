# OpenPal Rider

![OpenPal UI icon](mobile-ui/asset/app-icon.png)

PalRider is OpenPal's student ride-sharing system for campus trips. It includes a Spring Boot backend, an Expo mobile app for rider onboarding and auth, and a simple marketing website.

## What is PalRider?

PalRider helps university students find and share rides with other students on campus. Right now, the product focuses on the basics: sign-up, login, onboarding, and a universities list. Ride matching comes later.

## Components

- Backend API (this repo) — Spring Boot + Gradle.
- Mobile app (this repo) — Expo + React Native + TypeScript in `mobile-ui/`.
- Website (sibling folder) — React + Vite in `../OpenPal-Website/`.

## Tech Stack

- Java + Spring Boot
- Gradle
- Docker

## Run the system

### 1) Backend API

Run locally:

```bash
./gradlew bootRun
```

Run with Docker:

```bash
docker compose up --build
```

### 2) Mobile app

```bash
cd mobile-ui
npm install
npm start
```

The backend base URL is set in `mobile-ui/src/api/client.ts` and defaults to `http://localhost:8080`.

### 3) Website

```bash
cd ../OpenPal-Website
npm install
npm run dev
```

## Architecture

```
  Student
    │
    │  taps: "Log in" or "Sign up"
    │  enters: email + password
    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (Expo)                         │
│          screens + UI state in React Native                  │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTPS request
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Client (mobile-ui)                      │
│             builds requests + parses responses               │
└──────────────────────────┬──────────────────────────────────┘
                           │  POST /login-user
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend API (Spring Boot)                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                Controllers (REST)                     │  │
│  └─────────────────────────┬─────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────┼─────────────────────────────┐  │
│  │                 Services (Logic)                      │  │
│  │  - validate credentials                               │  │
│  │  - load user                                          │  │
│  │  - issue JWT token                                    │  │
│  └─────────────────────────┬─────────────────────────────┘  │
│                            │                                │
│  ┌─────────────────────────┼─────────────────────────────┐  │
│  │              Repositories (Data)                      │  │
│  └─────────────────────────┬─────────────────────────────┘  │
└───────────────────────────┼────────────────────────────────┘
                            │
                            ▼
                     Database (users)

                           ▲
                           │  200 OK: { token }
                           │  OR error JSON
┌──────────────────────────┴──────────────────────────────────┐
│                  API Client (mobile-ui)                      │
│  - stores JWT in Expo Secure Store                            │
│  - returns result to UI                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (Expo)                         │
│  - renders success or error                                   │
│  - uses JWT on future requests                                │
└─────────────────────────────────────────────────────────────┘

  Marketing Website (Vite)
    │
    ▼
  Static assets -> Browser
```

## How it works (step-by-step)

### Signup + email verification

1. Mobile app validates the signup form (basic format checks).
2. `POST /api/user/create-user` is sent with profile data.
3. Backend validates fields, checks the school list, and ensures the email is unused.
4. Backend generates a username, hashes the password, and stores a pending signup in memory.
5. A 4-digit code is emailed to the user.
6. User submits the code to `POST /api/user/verify-email`.
7. Backend verifies the code and persists the user in the database.

### Login + JWT

1. Mobile app submits email + password to `POST /login-user`.
2. Backend verifies the password hash and issues a JWT token.
3. Mobile app stores the token in `expo-secure-store` and moves to Home.

### Forgot password + reset

1. Mobile app submits email to `POST /forgot-password`.
2. If the email exists, backend generates a one-time reset token and stores it with an expiry.
3. User submits token + new password to `POST /reset-password`.
4. Backend validates token/expiry, updates the password hash, and clears the reset token.

### Universities list

1. Signup screen calls `GET /api/universities`.
2. Backend reads the CSV and returns `{ count, universities }`.

### Health check

1. Home screen calls `GET /api/`.
2. Backend responds with a simple JSON payload.

## Project Structure

```
app/src/main/java/openpal
├── configuration   # App configuration
├── controllers     # REST endpoints
├── database        # Entities & repositories
└── services        # Business logic
```

## Build

```bash
./gradlew build
```
