-- Verify and fix RLS policies for organizations table
-- Run this in Supabase SQL Editor to diagnose and fix the RLS issue

-- Step 1: Check if RLS is enabled on organizations table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'organizations';
-- Expected: rowsecurity = true

-- Step 2: View all existing policies on organizations table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'organizations';
-- This will show you what policies currently exist

-- Step 3: Enable RLS if not already enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop and recreate all organization policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can update their organization" ON organizations;

-- Step 5: Create organization policies
CREATE POLICY "Users can view their organization"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their organization"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Step 6: Verify policies were created
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'organizations';
-- You should see 3 policies: SELECT, INSERT, and UPDATE

-- Step 7: Test that authenticated users can insert (run this to verify)
-- This will show if the authenticated role can insert
SELECT
  polname as policy_name,
  polcmd as command,
  polroles::regrole[] as roles,
  polpermissive as permissive
FROM pg_policy
WHERE polrelid = 'organizations'::regclass;
