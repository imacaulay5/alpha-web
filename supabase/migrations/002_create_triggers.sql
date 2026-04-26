-- ============================================
-- TRIGGER: Auto-update updated_at timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Auto-generate invoice numbers
-- ============================================

CREATE SEQUENCE invoice_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || LPAD(nextval('invoice_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number BEFORE INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- ============================================
-- TRIGGER: Calculate invoice line item amounts
-- ============================================

CREATE OR REPLACE FUNCTION calculate_line_item_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.amount := NEW.quantity * NEW.rate;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_invoice_line_item_amount
    BEFORE INSERT OR UPDATE ON invoice_line_items
    FOR EACH ROW EXECUTE FUNCTION calculate_line_item_amount();

-- ============================================
-- FUNCTION: Calculate billable rate for time entry
-- ============================================

CREATE OR REPLACE FUNCTION calculate_billable_rate(
    project_id_param UUID,
    task_id_param UUID
)
RETURNS NUMERIC AS $$
DECLARE
    rate NUMERIC;
BEGIN
    -- Check task rate first
    IF task_id_param IS NOT NULL THEN
        SELECT t.rate INTO rate
        FROM tasks t
        WHERE t.id = task_id_param AND t.rate IS NOT NULL;

        IF rate IS NOT NULL THEN
            RETURN rate;
        END IF;
    END IF;

    -- Fall back to project rate
    SELECT p.rate INTO rate
    FROM projects p
    WHERE p.id = project_id_param;

    RETURN rate;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-calculate billable rate on time entry
-- ============================================

CREATE OR REPLACE FUNCTION set_time_entry_billable_rate()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.billable_rate IS NULL THEN
        NEW.billable_rate := calculate_billable_rate(NEW.project_id, NEW.task_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_time_entry_rate
    BEFORE INSERT OR UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION set_time_entry_billable_rate();
