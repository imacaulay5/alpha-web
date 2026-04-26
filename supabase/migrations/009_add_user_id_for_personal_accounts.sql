-- ============================================
-- ADD USER_ID COLUMNS FOR PERSONAL ACCOUNT OWNERSHIP
-- ============================================
-- This migration adds user_id columns to clients, projects, and invoices
-- to support personal/freelancer accounts that don't have an organization.
--
-- For business accounts: user_id is NULL (owned by organization)
-- For personal accounts: user_id is set (owned by specific user)

-- ============================================
-- ADD USER_ID COLUMNS
-- ============================================

-- Add user_id to clients table
ALTER TABLE clients
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id to projects table
ALTER TABLE projects
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id to invoices table
ALTER TABLE invoices
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- ADD INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);

-- ============================================
-- ADD CONSTRAINTS
-- ============================================

-- Ensure that records have either organization_id OR user_id, but not both
-- For clients
ALTER TABLE clients
ADD CONSTRAINT clients_ownership_check
CHECK (
    (organization_id IS NOT NULL AND user_id IS NULL) OR
    (organization_id IS NULL AND user_id IS NOT NULL)
);

-- For projects
ALTER TABLE projects
ADD CONSTRAINT projects_ownership_check
CHECK (
    (organization_id IS NOT NULL AND user_id IS NULL) OR
    (organization_id IS NULL AND user_id IS NOT NULL)
);

-- For invoices
ALTER TABLE invoices
ADD CONSTRAINT invoices_ownership_check
CHECK (
    (organization_id IS NOT NULL AND user_id IS NULL) OR
    (organization_id IS NULL AND user_id IS NOT NULL)
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('clients', 'projects', 'invoices')
AND column_name = 'user_id';
