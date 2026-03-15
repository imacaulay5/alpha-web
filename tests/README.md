# Playwright QA

This repo has a Playwright setup for web QA.

## Run

Set the required Supabase env vars first, then run:

```bash
npm run test:e2e
```

## Optional QA account coverage

If you have seeded QA accounts, set these before running Playwright to enable the real signed-in invoice checks:

```bash
# Business (also used for create/edit invoice coverage)
export PLAYWRIGHT_QA_BUSINESS_EMAIL='qa-business@example.com'
export PLAYWRIGHT_QA_BUSINESS_PASSWORD='super-secret-password'

# Freelancer
export PLAYWRIGHT_QA_FREELANCER_EMAIL='qa-freelancer@example.com'
export PLAYWRIGHT_QA_FREELANCER_PASSWORD='super-secret-password'

# Personal
export PLAYWRIGHT_QA_PERSONAL_EMAIL='qa-personal@example.com'
export PLAYWRIGHT_QA_PERSONAL_PASSWORD='super-secret-password'
```

For backwards compatibility, the business account also accepts the existing generic names:

```bash
export PLAYWRIGHT_QA_EMAIL='qa-business@example.com'
export PLAYWRIGHT_QA_PASSWORD='super-secret-password'
```

Legacy non-prefixed names also work:

```bash
export QA_BUSINESS_EMAIL='qa-business@example.com'
export QA_BUSINESS_PASSWORD='super-secret-password'
export QA_FREELANCER_EMAIL='qa-freelancer@example.com'
export QA_FREELANCER_PASSWORD='super-secret-password'
export QA_PERSONAL_EMAIL='qa-personal@example.com'
export QA_PERSONAL_PASSWORD='super-secret-password'
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
- optional multi-account sign-in coverage for business, freelancer, and personal accounts
- optional invoice page reachability for business and freelancer accounts
- optional new invoice dialog coverage for business and freelancer accounts
- optional personal-account assertion that invoice creation is not present in main navigation
- optional business-account invoice create coverage when seeded clients exist
- optional business-account invoice edit dialog coverage when seeded invoices exist

## Next flows to add

- auth recovery routing
- onboarding routing
- invoice PDF preview/download smoke
- deeper invoice edit assertions once QA data is guaranteed stable
