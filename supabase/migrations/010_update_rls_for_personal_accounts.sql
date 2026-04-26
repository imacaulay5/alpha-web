-- ============================================
-- UPDATE RLS POLICIES FOR PERSONAL ACCOUNTS
-- ============================================
-- This migration updates RLS policies to support users without organizations
-- (personal and freelancer accounts). These users have organization_id = NULL
-- and own data via user_id column.

-- ============================================
-- USERS POLICIES
-- ============================================

-- Personal accounts can view their own profile (already works)
-- But we need to ensure they can't be blocked by organization-based queries

DROP POLICY IF EXISTS "Users can view users in their organization" ON users;

CREATE POLICY "Users can view users in their organization"
    ON users FOR SELECT
    USING (
        -- Personal accounts: can only see themselves
        -- Business accounts: can see users in their organization
        organization_id = get_user_organization_id()
        OR id = auth.uid()
    );

-- ============================================
-- CLIENTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view clients in their organization" ON clients;
DROP POLICY IF EXISTS "Users can create clients in their organization" ON clients;
DROP POLICY IF EXISTS "Users can update clients in their organization" ON clients;
DROP POLICY IF EXISTS "Users can delete clients in their organization" ON clients;

CREATE POLICY "Users can view their clients"
    ON clients FOR SELECT
    USING (
        -- Business accounts: see organization clients
        (organization_id IS NOT NULL AND organization_id = get_user_organization_id())
        OR
        -- Personal accounts: see only their own clients
        (user_id IS NOT NULL AND user_id = auth.uid())
    );

CREATE POLICY "Users can create their clients"
    ON clients FOR INSERT
    WITH CHECK (
        -- Business accounts: create in their organization
        (organization_id IS NOT NULL AND organization_id = get_user_organization_id() AND user_id IS NULL)
        OR
        -- Personal accounts: create with user_id = self and no organization
        (user_id IS NOT NULL AND user_id = auth.uid() AND organization_id IS NULL)
    );

CREATE POLICY "Users can update their clients"
    ON clients FOR UPDATE
    USING (
        -- Business accounts: update organization clients
        (organization_id IS NOT NULL AND organization_id = get_user_organization_id())
        OR
        -- Personal accounts: update only their own clients
        (user_id IS NOT NULL AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete their clients"
    ON clients FOR DELETE
    USING (
        -- Business accounts: delete organization clients
        (organization_id IS NOT NULL AND organization_id = get_user_organization_id())
        OR
        -- Personal accounts: delete only their own clients
        (user_id IS NOT NULL AND user_id = auth.uid())
    );

-- ============================================
-- PROJECTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view projects in their organization" ON projects;
DROP POLICY IF EXISTS "Users can create projects in their organization" ON projects;
DROP POLICY IF EXISTS "Users can update projects in their organization" ON projects;
DROP POLICY IF EXISTS "Users can delete projects in their organization" ON projects;

CREATE POLICY "Users can view their projects"
    ON projects FOR SELECT
    USING (
        -- Business accounts: see organization projects
        (organization_id IS NOT NULL AND organization_id = get_user_organization_id())
        OR
        -- Personal accounts: see only their own projects
        (user_id IS NOT NULL AND user_id = auth.uid())
    );

CREATE POLICY "Users can create their projects"
    ON projects FOR INSERT
    WITH CHECK (
        -- Business accounts: create in their organization
        (organization_id IS NOT NULL AND organization_id = get_user_organization_id() AND user_id IS NULL)
        OR
        -- Personal accounts: create with user_id = self and no organization
        (user_id IS NOT NULL AND user_id = auth.uid() AND organization_id IS NULL)
    );

CREATE POLICY "Users can update their projects"
    ON projects FOR UPDATE
    USING (
        -- Business accounts: update organization projects
        (organization_id IS NOT NULL AND organization_id = get_user_organization_id())
        OR
        -- Personal accounts: update only their own projects
        (user_id IS NOT NULL AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete their projects"
    ON projects FOR DELETE
    USING (
        -- Business accounts: delete organization projects
        (organization_id IS NOT NULL AND organization_id = get_user_organization_id())
        OR
        -- Personal accounts: delete only their own projects
        (user_id IS NOT NULL AND user_id = auth.uid())
    );

-- ============================================
-- INVOICES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view invoices in their organization" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices in their organization" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices in their organization" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices in their organization" ON invoices;

CREATE POLICY "Users can view their invoices"
    ON invoices FOR SELECT
    USING (
        -- Business accounts: see organization invoices
        (organization_id IS NOT NULL AND organization_id = get_user_organization_id())
        OR
        -- Personal accounts: see only their own invoices
        (user_id IS NOT NULL AND user_id = auth.uid())
    );

CREATE POLICY "Users can create their invoices"
    ON invoices FOR INSERT
    WITH CHECK (
        -- Business accounts: create in their organization
        (organization_id IS NOT NULL AND organization_id = get_user_organization_id() AND user_id IS NULL)
        OR
        -- Personal accounts: create with user_id = self and no organization
        (user_id IS NOT NULL AND user_id = auth.uid() AND organization_id IS NULL)
    );

CREATE POLICY "Users can update their invoices"
    ON invoices FOR UPDATE
    USING (
        -- Business accounts: update organization invoices
        (organization_id IS NOT NULL AND organization_id = get_user_organization_id())
        OR
        -- Personal accounts: update only their own invoices
        (user_id IS NOT NULL AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete their invoices"
    ON invoices FOR DELETE
    USING (
        -- Business accounts: delete organization invoices
        (organization_id IS NOT NULL AND organization_id = get_user_organization_id())
        OR
        -- Personal accounts: delete only their own invoices
        (user_id IS NOT NULL AND user_id = auth.uid())
    );

-- ============================================
-- TASKS POLICIES
-- ============================================
-- Tasks are accessed through projects, so the project-level RLS handles both cases
-- No changes needed here

-- ============================================
-- TIME ENTRIES AND EXPENSES
-- ============================================
-- Time entries and expenses already use user_id = auth.uid() as primary check
-- so they work correctly for personal accounts without modification

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify policies were created correctly
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('clients', 'projects', 'invoices', 'users')
ORDER BY tablename, cmd;
