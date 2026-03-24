-- Add debt_amount to budgets table
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS debt_amount NUMERIC NOT NULL DEFAULT 0;
