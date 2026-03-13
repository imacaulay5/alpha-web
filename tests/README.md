# Playwright QA

This repo has a Playwright setup for web QA.

## Run

Set the required Supabase env vars first, then run:

```bash
npm run test:e2e
```

## Current coverage

Smoke:
- home page loads
- login page loads
- signup page loads

Feature flows:
- login validation errors
- signup password mismatch validation
- signup verification state

## Next flows to add

- auth recovery routing
- onboarding routing
- invoice create flow
- invoice edit flow
