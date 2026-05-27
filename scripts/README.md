# scripts/

Local helper scripts that talk directly to the Supabase Postgres used by the
backend. They read connection settings from the project-root `.env`.

## seed-test-users.mjs

Creates 8 pre-verified Luther College accounts and seeds 4 driver posts +
4 passenger posts so you can exercise the feed / booking / messaging flows
without going through the real email verification step.

```bash
cd scripts
npm install   # first time only — installs pg, bcryptjs, dotenv
npm run seed  # idempotent: wipes the previous run first, then re-seeds
npm run wipe  # remove just the seeded fixtures
```

All accounts share the password `Test1234!`. The emails are
`avery.hansen01@luther.edu` through `hana.thompson08@luther.edu` — pick any
one and log in on the phone.
