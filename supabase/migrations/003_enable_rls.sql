-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Get current user's organization
-- ============================================

CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- ORGANIZATIONS POLICIES
-- ============================================

CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (id = get_user_organization_id());

CREATE POLICY "Owners can update their organization"
    ON organizations FOR UPDATE
    USING (id = get_user_organization_id() AND (
        SELECT role FROM users WHERE id = auth.uid()
    ) IN ('OWNER', 'ADMIN'));

-- ============================================
-- USERS POLICIES
-- ============================================

CREATE POLICY "Users can view users in their organization"
    ON users FOR SELECT
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (id = auth.uid());

-- ============================================
-- CLIENTS POLICIES
-- ============================================

CREATE POLICY "Users can view clients in their organization"
    ON clients FOR SELECT
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create clients in their organization"
    ON clients FOR INSERT
    WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update clients in their organization"
    ON clients FOR UPDATE
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete clients in their organization"
    ON clients FOR DELETE
    USING (organization_id = get_user_organization_id());

-- ============================================
-- PROJECTS POLICIES
-- ============================================

CREATE POLICY "Users can view projects in their organization"
    ON projects FOR SELECT
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create projects in their organization"
    ON projects FOR INSERT
    WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update projects in their organization"
    ON projects FOR UPDATE
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete projects in their organization"
    ON projects FOR DELETE
    USING (organization_id = get_user_organization_id());

-- ============================================
-- TASKS POLICIES
-- ============================================

CREATE POLICY "Users can view tasks for projects in their organization"
    ON tasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tasks.project_id
            AND projects.organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Users can create tasks for projects in their organization"
    ON tasks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_id
            AND projects.organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Users can update tasks in their organization"
    ON tasks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tasks.project_id
            AND projects.organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Users can delete tasks in their organization"
    ON tasks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tasks.project_id
            AND projects.organization_id = get_user_organization_id()
        )
    );

-- ============================================
-- TIME ENTRIES POLICIES
-- ============================================

CREATE POLICY "Users can view their own time entries"
    ON time_entries FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all time entries in organization"
    ON time_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('OWNER', 'ADMIN')
            AND EXISTS (
                SELECT 1 FROM projects
                WHERE projects.id = time_entries.project_id
                AND projects.organization_id = users.organization_id
            )
        )
    );

CREATE POLICY "Users can create their own time entries"
    ON time_entries FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own time entries"
    ON time_entries FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time entries"
    ON time_entries FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- EXPENSES POLICIES
-- ============================================

CREATE POLICY "Users can view their own expenses"
    ON expenses FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all expenses in organization"
    ON expenses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('OWNER', 'ADMIN')
            AND users.organization_id = (
                SELECT organization_id FROM users WHERE id = expenses.user_id
            )
        )
    );

CREATE POLICY "Users can create their own expenses"
    ON expenses FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own expenses"
    ON expenses FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own expenses"
    ON expenses FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- EXPENSE LINE ITEMS POLICIES
-- ============================================

CREATE POLICY "Users can view expense line items for their expenses"
    ON expense_line_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM expenses
            WHERE expenses.id = expense_line_items.expense_id
            AND expenses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create line items for their expenses"
    ON expense_line_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM expenses
            WHERE expenses.id = expense_id
            AND expenses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update line items for their expenses"
    ON expense_line_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM expenses
            WHERE expenses.id = expense_line_items.expense_id
            AND expenses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete line items for their expenses"
    ON expense_line_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM expenses
            WHERE expenses.id = expense_line_items.expense_id
            AND expenses.user_id = auth.uid()
        )
    );

-- ============================================
-- INVOICES POLICIES
-- ============================================

CREATE POLICY "Users can view invoices in their organization"
    ON invoices FOR SELECT
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create invoices in their organization"
    ON invoices FOR INSERT
    WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update invoices in their organization"
    ON invoices FOR UPDATE
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete invoices in their organization"
    ON invoices FOR DELETE
    USING (organization_id = get_user_organization_id());

-- ============================================
-- INVOICE LINE ITEMS POLICIES
-- ============================================

CREATE POLICY "Users can view invoice line items in their organization"
    ON invoice_line_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_line_items.invoice_id
            AND invoices.organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Users can create invoice line items in their organization"
    ON invoice_line_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_id
            AND invoices.organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Users can update invoice line items in their organization"
    ON invoice_line_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_line_items.invoice_id
            AND invoices.organization_id = get_user_organization_id()
        )
    );

CREATE POLICY "Users can delete invoice line items in their organization"
    ON invoice_line_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_line_items.invoice_id
            AND invoices.organization_id = get_user_organization_id()
        )
    );
