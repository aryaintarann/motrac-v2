import { z } from 'zod'

// Authentication Schemas
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
})

export const signupSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(255, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
})

// Transaction Schemas
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type must be either income or expense' })
  }),
  account_id: z.string()
    .uuid('Invalid account ID'),
  category_id: z.string()
    .uuid('Invalid category ID')
    .optional()
    .nullable(),
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large')
    .refine((val) => Number.isFinite(val), 'Invalid amount'),
  note: z.string()
    .max(500, 'Note is too long')
    .optional()
    .nullable(),
  date: z.string()
    .datetime('Invalid date format')
    .optional()
})

// Budget Schemas
export const budgetSchema = z.object({
  month: z.string()
    .regex(/^\d{4}-\d{2}$/, 'Month must be in format YYYY-MM'),
  needs_amount: z.number()
    .nonnegative('Needs amount cannot be negative')
    .max(999999999.99, 'Amount is too large'),
  wants_amount: z.number()
    .nonnegative('Wants amount cannot be negative')
    .max(999999999.99, 'Amount is too large'),
  savings_amount: z.number()
    .nonnegative('Savings amount cannot be negative')
    .max(999999999.99, 'Amount is too large'),
  debt_amount: z.number()
    .nonnegative('Debt amount cannot be negative')
    .max(999999999.99, 'Amount is too large')
    .optional()
})

// Debt Schemas
export const debtSchema = z.object({
  direction: z.enum(['i_owe', 'owed_to_me'], {
    errorMap: () => ({ message: 'Direction must be either i_owe or owed_to_me' })
  }),
  counterparty: z.string()
    .min(1, 'Counterparty name is required')
    .max(255, 'Counterparty name is too long')
    .regex(/^[a-zA-Z0-9\s'-]+$/, 'Counterparty name contains invalid characters'),
  principal: z.number()
    .positive('Principal must be positive')
    .max(999999999.99, 'Principal is too large'),
  due_date: z.string()
    .datetime('Invalid date format')
    .optional()
    .nullable(),
  account_id: z.string()
    .uuid('Invalid account ID')
    .optional()
    .nullable()
})

// Category Schemas
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name is too long')
    .regex(/^[a-zA-Z0-9\s'-]+$/, 'Category name contains invalid characters'),
  icon: z.string()
    .max(10, 'Icon is too long')
    .optional(),
  parent_id: z.string()
    .uuid('Invalid parent category ID')
    .optional()
    .nullable(),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type must be either income or expense' })
  })
})

// Account Schemas
export const accountSchema = z.object({
  name: z.string()
    .min(1, 'Account name is required')
    .max(100, 'Account name is too long')
    .regex(/^[a-zA-Z0-9\s'-]+$/, 'Account name contains invalid characters'),
  type: z.enum(['cash', 'bank', 'e-wallet'], {
    errorMap: () => ({ message: 'Type must be cash, bank, or e-wallet' })
  }),
  balance: z.number()
    .finite('Balance must be a valid number')
    .max(999999999.99, 'Balance is too large')
})

// Helper function to validate FormData
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData
): T {
  const data: Record<string, any> = {}
  
  for (const [key, value] of formData.entries()) {
    // Convert numeric strings to numbers for schema validation
    if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
      data[key] = Number(value)
    } else if (value === '' || value === null) {
      data[key] = null
    } else {
      data[key] = value
    }
  }
  
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const firstError = result.error.errors[0]
    throw new Error(firstError.message)
  }
  
  return result.data
}

// Sanitization helpers
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return ''
  
  // Remove any potential XSS vectors
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000) // Max length for safety
}

export function sanitizeNote(note: string | null | undefined): string | null {
  if (!note) return null
  return sanitizeString(note).slice(0, 500)
}
