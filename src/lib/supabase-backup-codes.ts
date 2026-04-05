import { createClient } from '@/utils/supabase/client'

export interface BackupCode {
  id: string
  code: string
  used: boolean
  used_at: string | null
  created_at: string
}

export class SupabaseBackupCodes {
  private supabase = createClient()

  /**
   * Generate new backup codes for the current user
   * This will delete existing codes and create 10 new ones
   */
  async generateBackupCodes(): Promise<string[]> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase.rpc('generate_backup_codes', {
      user_uuid: user.user.id
    })

    if (error) {
      console.error('Error generating backup codes:', error)
      throw new Error('Failed to generate backup codes')
    }

    return data || []
  }

  /**
   * Get all backup codes for the current user
   */
  async getBackupCodes(): Promise<BackupCode[]> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase
      .from('user_backup_codes')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      // Check if it's a table not found error (database not set up)
      if (error.code === 'PGRST205' || error.message?.includes('user_backup_codes')) {
        console.warn('Backup codes table not found. Database schema needs to be run.')
        return []
      }
      console.error('Error fetching backup codes:', error)
      throw new Error('Failed to fetch backup codes')
    }

    return data || []
  }

  /**
   * Validate a backup code
   */
  async validateBackupCode(code: string): Promise<boolean> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase.rpc('validate_backup_code', {
      user_uuid: user.user.id,
      input_code: code.trim()
    })

    if (error) {
      console.error('Error validating backup code:', error)
      throw new Error('Failed to validate backup code')
    }

    return data === true
  }

  /**
   * Check if user has unused backup codes
   */
  async hasUnusedBackupCodes(): Promise<boolean> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    const { data, error } = await this.supabase.rpc('has_unused_backup_codes', {
      user_uuid: user.user.id
    })

    if (error) {
      console.error('Error checking backup codes:', error)
      return false
    }

    return data === true
  }

  /**
   * Get count of unused backup codes
   */
  async getUnusedCodeCount(): Promise<number> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) return 0

    const { data, error } = await this.supabase
      .from('user_backup_codes')
      .select('id', { count: 'exact' })
      .eq('user_id', user.user.id)
      .eq('used', false)

    if (error) {
      console.error('Error counting backup codes:', error)
      return 0
    }

    return data?.length || 0
  }

  /**
   * Download backup codes as text file
   */
  downloadBackupCodes(codes: BackupCode[], userEmail: string) {
    const codesText = codes
      .map(code => `${code.code}${code.used ? ' (USED)' : ''}`)
      .join('\n')
    
    const content = [
      'DanaRoute - Backup Recovery Codes',
      '=====================================',
      `Generated: ${new Date().toLocaleDateString('id-ID')}`,
      `Account: ${userEmail}`,
      '',
      'IMPORTANT INSTRUCTIONS:',
      '- Each backup code can only be used once',
      '- Store these codes in a safe place (password manager recommended)',
      '- Use these codes if you lose access to your authenticator app',
      '- Generate new codes if you suspect these are compromised',
      '',
      'BACKUP CODES:',
      '=============',
      codesText,
      '',
      '© DanaRoute by VarsaWeb - All rights reserved'
    ].join('\n')
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `danaroute-backup-codes-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Export singleton instance
export const backupCodesManager = new SupabaseBackupCodes()