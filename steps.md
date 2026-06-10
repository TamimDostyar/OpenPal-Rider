# OpenPal-Rider — Commands Cheat Sheet

> Run backend (`./gradlew`) commands from the **repo root**.
> Run mobile commands from the **`mobile-ui/`** directory.
> Backend config (DB, mail, JWT) is loaded from a `.env` file at the repo root — there are no Spring profiles.

## Backend — Tests

| What | Command |
|---|---|
| Run all tests | `./gradlew :app:test` |
| Force re-run (ignore "UP-TO-DATE" cache) | `./gradlew :app:test --rerun-tasks` |
| Run a single test **class** | `./gradlew :app:test --tests "openpal.controllers.AllSystemsEndpointTest"` |
| Run a single test **method** | `./gradlew :app:test --tests "openpal.controllers.AllSystemsEndpointTest.homeRouteTest"` |
| Run tests matching a wildcard | `./gradlew :app:test --tests "openpal.controllers.*"` |
| Run tests + see full output / stacktraces | `./gradlew :app:test --info` |
| Open the HTML test report | open `build/app/reports/tests/test/index.html` |

## Backend — Run (dev / test mode)

| What | Command |
|---|---|
| Run the app locally (reads `.env`, hot reload via devtools) | `./gradlew :app:bootRun` |
| Run on a different port | `./gradlew :app:bootRun --args='--server.port=9090'` |
| Run with debug logging | `./gradlew :app:bootRun --args='--debug'` |
| App URL once running | http://localhost:8080/api/ |

## Backend — Build / Package (production mode)

| What | Command |
|---|---|
| Compile only | `./gradlew :app:compileJava` |
| Build everything (compile + test) | `./gradlew :app:build` |
| Build runnable fat jar (skip tests) | `./gradlew :app:bootJar -x test` |
| Run the production jar | `java -jar build/app/libs/*.jar` |
| Clean build outputs | `./gradlew clean` |
| List dependencies | `./gradlew :app:dependencies` |
| List all available tasks | `./gradlew :app:tasks` |

## Backend — Docker (production-like)

| What | Command |
|---|---|
| Build + start the server (needs `.env`) | `docker compose up --build` |
| Start in the background | `docker compose up -d` |
| Stop and remove | `docker compose down` |
| Build the image only | `docker build -t openpal-rider .` |

## Mobile App (Expo / React Native — run from `mobile-ui/`)

| What | Command |
|---|---|
| Install dependencies | `yarn install` |
| Start the Expo dev server (QR + menu) | `yarn start` |
| Run on Android device/emulator | `yarn android` |
| Run on iOS simulator (macOS) | `yarn ios` |
| Run in the browser | `yarn web` |
| Type-check (no emit) | `yarn typecheck` |

## Mobile App — Build (production)

| What | Command |
|---|---|
| Login to Expo (one-time) | `npx eas login` |
| Build Android (APK/AAB via EAS) | `npx eas build --platform android` |
| Build iOS via EAS | `npx eas build --platform ios` |
| Local Android release build | `cd android && ./gradlew assembleRelease` |

> Note: EAS commands require `eas-cli` and an Expo account; configure via `npx eas build:configure` first.

## Gradle wrapper — handy flags (logic to remember)

| Flag | What it does |
|---|---|
| `:app:` prefix | targets the `app` subproject specifically (multi-project build) |
| `--tests "Class.method"` | filter down to one class or one method |
| `--rerun-tasks` | ignore the build/test cache and run fresh |
| `-x <task>` | exclude a task, e.g. `-x test` to skip tests |
| `--no-daemon` | run without the background Gradle daemon (used in CI) |
| `--info` / `--debug` | increase log verbosity |
| `clean` | delete previous build outputs before running |
