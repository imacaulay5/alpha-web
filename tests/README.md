# Playwright QA

This repo has a Playwright setup for web QA.

## Run

Set the required Supabase env vars first, then run:

```bash
npm run test:e2e
```

## Optional authenticated flow testing

If you want the QA agent to test real signed-in flows, set:

```bash
QA_EMAIL=...
QA_PASSWORD=...
```

Then the authenticated tests will run.

## Current coverage

Smoke:
- home page loads
- login page loads
- signup page loads

Feature flows:
- login validation errors
- signup password mismatch validation
- signup post-submit state
- account type page interaction
- onboarding page form visibility

Authenticated flows:
- sign in with QA account
- reach invoices page after sign in

## Next flows to add

- auth recovery routing with a purpose-built recovery test account
- invoice create flow with a seeded QA account and client data
- invoice edit flow with seeded invoice data
