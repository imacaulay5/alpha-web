# Playwright QA

This repo has a Playwright setup for web QA.

## Run

Set the required Supabase env vars first, then run:

```bash
npm run test:e2e
```

## Optional QA account coverage

If you have a seeded QA account, set these before running Playwright to enable the real signed-in invoice checks:

```bash
export PLAYWRIGHT_QA_EMAIL='qa-user@example.com'
export PLAYWRIGHT_QA_PASSWORD='super-secret-password'
```

Without those env vars, the protected-route tests still run and the signed-in invoice tests are skipped.

## Current coverage

Smoke:
- home page loads
- login page loads
- signup page loads

Feature flows:
- login validation errors
- signup password mismatch validation
- signup verification state
- unauthenticated auth/dashboard/invoice redirect coverage
- optional real-account invoice reachability and new-invoice dialog coverage

## Next flows to add

- seeded business-account recovery to `/onboarding`
- seeded freelancer-account invoice create + edit happy path
- invoice PDF preview/download smoke once the QA data is stable
