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

Legacy names also work:

```bash
export QA_EMAIL='qa-user@example.com'
export QA_PASSWORD='super-secret-password'
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
- unauthenticated invoices redirect coverage
- optional real-account invoice reachability
- optional real-account new invoice dialog coverage
- optional real-account invoice create coverage when seeded clients exist
- optional real-account invoice edit dialog coverage when seeded invoices exist

## Next flows to add

- auth recovery routing
- onboarding routing
- invoice PDF preview/download smoke
- deeper invoice edit assertions once QA data is guaranteed stable
