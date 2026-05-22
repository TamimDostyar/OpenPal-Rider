# API Summary

Base URL: http://localhost:8000

## Health

- GET /api/
  - Returns a simple success payload.

## Profile and signup

- POST /api/user/create-user
  - Starts signup, validates input, sends 4-digit verification code.
- POST /api/user/verify-email
  - Confirms verification code and creates the profile in the database.
- POST /api/user/resend-code
  - Resends a new 4-digit verification code for a pending signup.

## Login

- POST /login-user
  - Validates credentials and returns a JWT token.

## Password reset

- POST /forgot-password
  - Issues a one-time reset token (returns generic message; token returned for now).
- POST /reset-password
  - Redeems a reset token and updates the password.

## Universities

- GET /api/universities
  - Returns count and list of US universities from a CSV resource.

## Notes

- Error payloads are returned as JSON with an "error" key.
- Signup is a two-step flow and the account is only created after email verification.
