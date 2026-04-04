import { createClient } from '@/utils/supabase/server'

export type AuditAction = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'SIGNUP'
  | 'LOGOUT'
  | 'ACCOUNT_DELETE'
  | 'TRANSACTION_CREATE'
  | 'TRANSACTION_UPDATE'
  | 'TRANSACTION_DELETE'
  | 'BUDGET_UPDATE'
  | 'DEBT_CREATE'
  | 'DEBT_PAID'
  | 'CATEGORY_CREATE'
  | 'DATA_EXPORT'
  | 'PASSWORD_CHANGE'
  | 'EMAIL_CHANGE'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'

interface AuditLogEntry {
  user_id: string | null
  action: AuditAction
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  status: 'success' | 'failure'
}

/**
 * Logs security-relevant events to audit trail
 * IMPORTANT: This requires the audit_log table to exist in Supabase
 * See SUPABASE_RLS_POLICIES.md for SQL to create the table
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient()
    
    await supabase.from('audit_log').insert({
      user_id: entry.user_id,
      action: entry.action,
      details: entry.details || {},
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      status: entry.status,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    // Don't throw - logging should never break the application
    // But do log to console for monitoring
    console.error('[AUDIT_LOG_ERROR]', error)
  }
}

/**
 * Helper to log successful operations
 */
export async function logSuccess(
  action: AuditAction,
  userId: string,
  details?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    user_id: userId,
    action,
    details,
    status: 'success'
  })
}

/**
 * Helper to log failed operations (security violations)
 */
export async function logFailure(
  action: AuditAction,
  userId: string | null,
  details?: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    user_id: userId,
    action,
    details,
    ip_address: ipAddress,
    status: 'failure'
  })
}

/**
 * Get audit logs for a specific user (admin function)
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 100
): Promise<any[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('[AUDIT_LOG_FETCH_ERROR]', error)
    return []
  }
  
  return data || []
}

/**
 * Get failed login attempts for an IP (for rate limiting)
 */
export async function getFailedLoginAttempts(
  ipAddress: string,
  timeWindowMinutes: number = 60
): Promise<number> {
  const supabase = await createClient()
  const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000).toISOString()
  
  const { data, error } = await supabase
    .from('audit_log')
    .select('id')
    .eq('action', 'LOGIN_FAILED')
    .eq('ip_address', ipAddress)
    .gte('created_at', cutoffTime)
  
  if (error) {
    console.error('[AUDIT_LOG_COUNT_ERROR]', error)
    return 0
  }
  
  return data?.length || 0
}
