# Frontend Handoff Report (API Contract)

This document is the API contract for the OpenPal backend in this repo. It is intended for frontend implementation.

## Base URL

- Local: http://localhost:8000
- All requests use JSON and return JSON.

## Auth

- Login returns a JWT token in the response body.
- This backend does not currently enforce auth on routes in code, but the frontend should store the JWT for future protected endpoints.

## Common error format

- Errors return JSON: {"error": "message"}
- Status codes vary per endpoint (see below).

## Endpoints

### Health

GET /api/

Response 200:
{
  "Success": "Hey bro"
}

---

### Signup (step 1: create user)

POST /api/user/create-user

Request body:
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "dob": "2002-05-12",
  "school": "University of Washington",
  "graduationDate": "2026-06-01",
  "phoneNumber": 1234567890,
  "password": "plain-text-password"
}

Responses:
- 202 Accepted
  {
    "email": "jane@example.com",
    "message": "a 4-digit verification code has been sent to your email; confirm it at /api/user/verify-email to create your account"
  }
- 400 Bad Request
  {"error": "name is required"}
  {"error": "email is required"}
  {"error": "phone number required"}
  {"error": "password is required"}
  {"error": "school is not a recognized US university"}
- 409 Conflict
  {"error": "an account with this email already exists"}

Notes:
- The account is not created in the database yet. It is stored in memory pending email verification.
- The verification code expires after 10 minutes.

---

### Signup (step 2: verify email)

POST /api/user/verify-email

Request body:
{
  "email": "jane@example.com",
  "code": "0427"
}

Responses:
- 201 Created
  {
    "id": "c0a8012e-9a0b-4e61-9c1a-1f8e3a5a2c93",
    "name": "Jane Doe",
    "userSpecialNumber": 1234,
    "username": "jan051234",
    "email": "jane@example.com",
    "dob": "2002-05-12",
    "school": "University of Washington",
    "graduationDate": "2026-06-01",
    "PhoneNumber": 1234567890,
    "emailVerified": true,
    "message": "email verified; account created"
  }
- 400 Bad Request
  {"error": "email is required"}
  {"error": "code is required"}
  {"error": "verification code has expired; start again at /api/user/create-user"}
  {"error": "incorrect verification code"}
- 404 Not Found
  {"error": "no pending signup for that email; start again at /api/user/create-user"}
- 409 Conflict
  {"error": "an account with this email already exists"}

Notes:
- The response field name is "PhoneNumber" with a capital P.
- If the server restarts before verification, pending signups are lost.

---

### Resend verification code

POST /api/user/resend-code

Request body:
{
  "email": "jane@example.com"
}

Responses:
- 200 OK
  {"message": "a new 4-digit verification code has been sent to your email"}
- 400 Bad Request
  {"error": "email is required"}
- 404 Not Found
  {"error": "no pending signup for that email; start again at /api/user/create-user"}

---

### Login

POST /login-user

Request body:
{
  "username": "optional",
  "email": "jane@example.com",
  "password": "plain-text-password"
}

Responses:
- 200 OK
  {"token": "<jwt>"}
- 400 Bad Request
  {"error": "email is required"}
  {"error": "password is required"}
- 401 Unauthorized
  {"error": "invalid email or password"}

Notes:
- Login uses email + password; username is ignored for verification.
- JWT expires in 1 hour and includes a role claim "user".

---

### Forgot password (issue reset token)

POST /forgot-password

Request body:
{
  "email": "jane@example.com"
}

Responses:
- 200 OK
  {"message": "if an account exists for that email, a reset token has been issued"}
  
  If the account exists, the response also includes:
  {"resetToken": "<token>"}

- 400 Bad Request
  {"error": "email is required"}

Notes:
- The reset token is returned in the response for now; this should be emailed in production.

---

### Reset password

POST /reset-password

Request body:
{
  "token": "<token>",
  "newPassword": "new-plain-text-password"
}

Responses:
- 200 OK
  {"message": "password has been reset"}
- 400 Bad Request
  {"error": "token is required"}
  {"error": "newPassword is required"}
  {"error": "invalid or expired reset token"}

Notes:
- Reset tokens expire after 30 minutes.

---

### Universities

GET /api/universities

Response 200:
{
  "count": 2,
  "universities": [
    {"name": "Example University", "url": "https://example.edu"},
    {"name": "Another University", "url": "https://another.edu"}
  ]
}

## Client implementation notes

- Treat all non-2xx responses as errors and show the backend error message.
- Signup is two-step; the user cannot log in until email verification completes.
- If SMTP is not configured, verification codes are logged server-side only.
- The pending signup cache is in memory; if verification fails due to expiry or server restart, restart the flow at create-user.
