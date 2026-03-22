-- Add debt_amount to budgets table
ALTER TABLE budgets ADD COLUMN debt_amount NUMERIC NOT NULL DEFAULT 0;
