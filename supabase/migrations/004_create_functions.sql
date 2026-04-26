-- ============================================
-- FUNCTION: Get dashboard metrics for user
-- ============================================

CREATE OR REPLACE FUNCTION get_dashboard_metrics(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    today DATE := CURRENT_DATE;
    week_start DATE := today - (EXTRACT(DOW FROM today)::INTEGER);
BEGIN
    SELECT json_build_object(
        'hours_today', COALESCE((
            SELECT SUM(duration_minutes) / 60.0
            FROM time_entries
            WHERE user_id = user_id_param
            AND start_at::DATE = today
        ), 0),
        'hours_week', COALESCE((
            SELECT SUM(duration_minutes) / 60.0
            FROM time_entries
            WHERE user_id = user_id_param
            AND start_at >= week_start
        ), 0),
        'pending_expenses_count', COALESCE((
            SELECT COUNT(*)
            FROM expenses
            WHERE user_id = user_id_param
            AND status IN ('DRAFT', 'SUBMITTED')
        ), 0),
        'pending_approvals_count', COALESCE((
            SELECT COUNT(*)
            FROM time_entries
            WHERE user_id = user_id_param
            AND status = 'SUBMITTED'
        ), 0),
        'outstanding_invoices_count', COALESCE((
            SELECT COUNT(*)
            FROM invoices i
            JOIN users u ON u.organization_id = i.organization_id
            WHERE u.id = user_id_param
            AND i.status IN ('SENT', 'OVERDUE')
        ), 0)
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Get business metrics for organization
-- ============================================

CREATE OR REPLACE FUNCTION get_business_metrics(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    org_id UUID;
    month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
    prev_month_start DATE;
    prev_month_end DATE;
BEGIN
    -- Get organization ID
    SELECT organization_id INTO org_id FROM users WHERE id = user_id_param;

    -- Calculate previous month range
    prev_month_start := (month_start - INTERVAL '1 month')::DATE;
    prev_month_end := (month_start - INTERVAL '1 day')::DATE;

    SELECT json_build_object(
        'total_revenue', COALESCE((
            SELECT SUM(total)
            FROM invoices
            WHERE organization_id = org_id AND status = 'PAID'
        ), 0),
        'outstanding_revenue', COALESCE((
            SELECT SUM(total)
            FROM invoices
            WHERE organization_id = org_id AND status IN ('SENT', 'OVERDUE')
        ), 0),
        'billable_hours_this_month', COALESCE((
            SELECT SUM(duration_minutes) / 60.0
            FROM time_entries
            WHERE user_id = user_id_param
            AND start_at >= month_start
            AND billable_rate IS NOT NULL
        ), 0),
        'pending_invoices', COALESCE((
            SELECT COUNT(*)
            FROM invoices
            WHERE organization_id = org_id AND status IN ('SENT', 'OVERDUE')
        ), 0)
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
