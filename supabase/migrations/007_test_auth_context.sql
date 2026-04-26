-- Test query to verify authentication context
-- Run this while logged in to see if auth.uid() works

-- This will show you the current authenticated user ID
SELECT auth.uid() as current_user_id, auth.role() as current_role;
-- Expected when logged in: current_user_id should show your UUID, role should be 'authenticated'
-- If you get NULL or 'anon', the session isn't being recognized

-- Test if you can manually insert an organization (this simulates what the app does)
-- Replace 'YOUR-USER-EMAIL' with the email you're testing with
DO $$
DECLARE
    test_email TEXT := 'YOUR-USER-EMAIL';
BEGIN
    -- This simulates what happens during signup
    RAISE NOTICE 'Testing organization insert...';
    RAISE NOTICE 'Current auth.uid(): %', auth.uid();
    RAISE NOTICE 'Current auth.role(): %', auth.role();
END $$;
