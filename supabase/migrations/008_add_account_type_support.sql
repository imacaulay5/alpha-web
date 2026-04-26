-- Migration: Add account type support to allow personal/freelancer accounts without organizations
-- This enables different user types: personal, freelancer, and business

-- Make organization_id nullable to support personal/freelancer accounts
ALTER TABLE users
ALTER COLUMN organization_id DROP NOT NULL;

-- Add account_type enum
CREATE TYPE account_type_enum AS ENUM ('personal', 'freelancer', 'business');

-- Add account_type column to users table
ALTER TABLE users
ADD COLUMN account_type account_type_enum NOT NULL DEFAULT 'business';

-- Update existing users to 'business' type (backward compatibility)
-- This ensures all current users continue working as business accounts
UPDATE users
SET account_type = 'business'
WHERE organization_id IS NOT NULL;

-- Add index for faster queries filtering by account type
CREATE INDEX idx_users_account_type ON users(account_type);

-- Add comment for documentation
COMMENT ON COLUMN users.account_type IS 'Type of account: personal (no org), freelancer (no org), or business (requires org)';
COMMENT ON COLUMN users.organization_id IS 'Organization ID - required for business accounts, null for personal/freelancer accounts';
