# System Architecture

## Scope and sources

This documentation reflects the OpenPal backend in this repository. Client apps and infrastructure outside this repo are included only as high-level placeholders when required for system context.

Primary source files:
- ../app/src/main/java/openpal/App.java
- ../app/src/main/java/openpal/services/
- ../app/src/main/java/openpal/database/account_mgt/
- ../app/src/main/java/openpal/controllers/security/
- ../app/src/main/resources/application.properties
- ../compose.yaml
- ../Dockerfile

## System overview

OpenPal is a ride-sharing app for university students. The backend is a Spring Boot service that handles user signup, email verification, login, password reset, and university directory lookup. The backend persists user profiles to PostgreSQL and sends verification codes through SMTP (Gmail by default).

## High-level components

- Client applications (external/unknown)
  - Web and/or mobile clients call the REST API.
  - Not in this repository.
- Backend API (this repository)
  - Spring Boot service exposing REST endpoints under /api and /login-user.
  - Core services: profile signup, login, password reset, university list.
- Database
  - PostgreSQL accessed via Spring Data JPA.
  - Primary table: profiles.
- Email provider
  - SMTP via Gmail for verification codes.

## Backend components

- Entry point
  - openpal.App - Spring Boot application bootstrap.
- REST services
  - ProfileService - signup and email verification flow.
  - LoginServices - JWT issuance for login.
  - ForgotPasswordService - password reset flow.
  - UniversityService - university list from CSV resource.
  - Routes - simple health route.
- Domain and persistence
  - CreateProfileDB - JPA entity for user profiles.
  - ProfileRepository - JPA repository for profiles.
  - PendingRegistration - in-memory pending signup data.
- Security utilities
  - JsonTokenWeb - JWT issue/parse (HS256, 1 hour expiry).
  - GoogleStep - 4-digit verification code generation.
- Supporting utilities
  - EmailService - SMTP send; logs the code when SMTP is not configured.
  - Utils - loads US university data from CSV resource.

## Data stores

- PostgreSQL
  - Profiles table (CreateProfileDB): user identity, contact data, password hash, email verification, and password reset token data.
  - ORM: Spring Data JPA.

- In-memory signup cache
  - PendingRegistration in ProfileService holds unverified signups with a 10-minute expiry.
  - Not persisted; if the service restarts, pending signups are lost.

## External integrations

- SMTP (Gmail)
  - Used to deliver 4-digit verification codes for signup.
  - Configured via MAIL_USERNAME and MAIL_PASSWORD.

## Authentication and security

- Passwords are stored as BCrypt hashes.
- Login issues a JWT (HS256) with a 1-hour expiry and role claim "user".
- Email verification is a two-step flow: create-user then verify-email with a 4-digit code.
- Password reset uses a one-time token stored with a 30-minute expiry.

## Key data flows

### Signup and email verification

1) Client posts signup data to /api/user/create-user.
2) Backend validates input and checks email uniqueness.
3) Backend generates username and special number.
4) Backend generates a 4-digit code and stores a PendingRegistration.
5) EmailService sends the code via SMTP (or logs it if SMTP is not configured).
6) Client posts email + code to /api/user/verify-email.
7) Backend validates code and creates the profile in PostgreSQL.

### Login

1) Client posts credentials to /login-user.
2) Backend verifies password hash via repository.
3) Backend returns a JWT token if valid.

### Password reset

1) Client posts email to /forgot-password.
2) Backend generates a token and stores it with expiry.
3) Client posts token + new password to /reset-password.
4) Backend validates token, updates password hash, clears token.

### University list

1) Client calls /api/universities.
2) Backend returns list from CSV resource data/us_universities.csv.

## Runtime configuration

- Database: DB_URL, DB_USERNAME, DB_PASSWORD
- SMTP: MAIL_USERNAME, MAIL_PASSWORD
- Mail sender: openpal.mail.from (defaults to MAIL_USERNAME)

## Deployment and topology

- The service runs on port 8000 in Docker Compose.
- The compose file defines only the server service; a sample PostgreSQL service is present but commented out.
- The Dockerfile currently uses Maven commands; this repo uses Gradle. Update is likely required for container builds.

## Assumptions and unknowns

- Client applications and infra are not in this repo. This documentation assumes they exist and call the REST API.
- API gateway, CDN, or other edge components are not documented in this repo.
- Observability, monitoring, and logging infrastructure is not defined here.
