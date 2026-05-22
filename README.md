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

The backend base URL is set in `mobile-ui/src/api/client.ts` and defaults to `http://localhost:8000`.

### 3) Website

```bash
cd ../OpenPal-Website
npm install
npm run dev
```

## Architecture

```mermaid
flowchart LR
	Mobile[Mobile App (Expo)] -->|Auth + onboarding API calls| API[Backend API (Spring Boot)]
	Web[Marketing Website (Vite)] -->|Static content| Browser[User Browser]
	API -->|Data| DB[(Database)]
```

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
