import { z } from 'zod';

// Shared Enums
export const AccountTypeEnum = z.enum(['cash', 'bank', 'e_wallet', 'investment', 'credit']);
export const TransactionTypeEnum = z.enum(['income', 'expense', 'transfer']);
export const DebtTypeEnum = z.enum(['owed_to', 'owed_by']);
export const DebtStatusEnum = z.enum(['active', 'paid']);
export const BudgetPeriodEnum = z.enum(['weekly', 'monthly', 'yearly']);
export const TransactionStatusEnum = z.enum(['pending', 'completed']);

// Schemas
export const AccountSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  type: AccountTypeEnum,
  balance: z.number().or(z.string().transform(Number)),
  currency: z.string().default('IDR'),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  include_in_net_worth: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CategorySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  type: TransactionTypeEnum,
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  account_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  amount: z.number().or(z.string().transform(Number)),
  type: TransactionTypeEnum,
  date: z.string(), // YYYY-MM-DD
  description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_recurring: z.boolean().default(false),
  status: TransactionStatusEnum.default('completed'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const DebtSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  type: DebtTypeEnum,
  total_amount: z.number().or(z.string().transform(Number)),
  remaining_amount: z.number().or(z.string().transform(Number)),
  interest_rate: z.number().or(z.string().transform(Number)).nullable().optional(),
  due_date: z.string().nullable().optional(),
  minimum_payment: z.number().or(z.string().transform(Number)).nullable().optional(),
  status: DebtStatusEnum.default('active'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const BudgetSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  amount: z.number().or(z.string().transform(Number)),
  period: BudgetPeriodEnum,
  start_date: z.string(),
  end_date: z.string(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

// Type Exports
export type Account = z.infer<typeof AccountSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Debt = z.infer<typeof DebtSchema>;
export type Budget = z.infer<typeof BudgetSchema>;

export type AccountType = z.infer<typeof AccountTypeEnum>;
export type TransactionType = z.infer<typeof TransactionTypeEnum>;
export type DebtType = z.infer<typeof DebtTypeEnum>;
export type BudgetPeriod = z.infer<typeof BudgetPeriodEnum>;
