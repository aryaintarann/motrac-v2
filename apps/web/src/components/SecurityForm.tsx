'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { deleteAccountServerAction } from '@/app/actions/deleteAccount'
import { useRouter } from 'next/navigation'

export function SecurityForm({ user }: { user: any }) {
  const supabase = createClient()
  const router = useRouter()
  
  // Password state
  const [passwordForm, setPasswordForm] = useState({ new: '', confirm: '' })
  const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' })
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false)

  // MFA State
  const [isMfaEnrolled, setIsMfaEnrolled] = useState(false)
  const [mfaSetup, setMfaSetup] = useState<{qrCode: string, secret: string, factorId: string} | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [mfaMessage, setMfaMessage] = useState({ text: '', type: '' })

  // Delete State
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    checkMfaStatus()
  }, [])

  const checkMfaStatus = async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (!error && data) {
      // If currentLevel is aal2, they logged in with MFA. 
      // If nextLevel is aal2, they HAVE MFA setup, but didn't use it this session.
      const isEnrolled = data.nextLevel === 'aal2' || data.currentLevel === 'aal2'
      setIsMfaEnrolled(isEnrolled)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdMessage({ text: '', type: '' })
    
    if (passwordForm.new !== passwordForm.confirm) {
      return setPwdMessage({ text: "New passwords don't match.", type: 'error' })
    }

    setIsUpdatingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new })
    setIsUpdatingPwd(false)

    if (error) {
      setPwdMessage({ text: error.message, type: 'error' })
    } else {
      setPwdMessage({ text: 'Password updated successfully.', type: 'success' })
      setPasswordForm({ new: '', confirm: '' })
    }
  }

  const startMfaSetup = async () => {
    setMfaMessage({ text: 'Generating QR code...', type: 'info' })
    
    // Clean up any previously orphaned unverified factors
    try {
      const { data: factorData } = await supabase.auth.mfa.listFactors()
      if (factorData && factorData.totp) {
        for (const factor of factorData.totp) {
          if ((factor as any).status === 'unverified') {
            await supabase.auth.mfa.unenroll({ factorId: factor.id })
          }
        }
      }
    } catch (e) {
      console.error(e)
    }

    const { data, error } = await supabase.auth.mfa.enroll({ 
      factorType: 'totp',
      friendlyName: `Motrac Auth ${new Date().toISOString().split('T')[0]}`
    })
    
    if (error) {
      setMfaMessage({ text: error.message, type: 'error' })
    } else if (data) {
      setMfaSetup({
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id
      })
      setMfaMessage({ text: '', type: '' })
    }
  }

  const verifyMfaSetup = async () => {
    if (!mfaSetup) return
    setMfaMessage({ text: 'Verifying code...', type: 'info' })
    
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: mfaSetup.factorId })
      if (challenge.error) throw challenge.error

      const verify = await supabase.auth.mfa.verify({
        factorId: mfaSetup.factorId,
        challengeId: challenge.data.id,
        code: totpCode
      })
      if (verify.error) throw verify.error

      setMfaMessage({ text: '2FA setup complete!', type: 'success' })
      setIsMfaEnrolled(true)
      setMfaSetup(null)
    } catch (error: any) {
      setMfaMessage({ text: error.message || 'Verification failed.', type: 'error' })
    }
  }

  const handleLogoutOthers = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'others' })
    if (error) alert("Failed to log out of other devices: " + error.message)
    else alert("Successfully logged out from all other devices.")
  }

  const handleExportData = async () => {
    const { data, error } = await supabase.from('transactions').select('*')
    if (error) return alert("Failed to fetch transactions.")
    if (!data || data.length === 0) return alert("No transactions found.")
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(','))
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "motrac_transactions.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return
    setIsDeleting(true)
    
    const res = await deleteAccountServerAction(user.id)
    if (res.success) {
      await supabase.auth.signOut()
      router.push('/login')
    } else {
      alert("Failed to delete account. Note: You need SUPABASE_SERVICE_ROLE_KEY configured in environment variables to bypass RLS. Error: " + res.error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Password Change */}
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm">
        <h3 className="font-bold text-[#0f172a] text-[18px] mb-6">Change Password</h3>
        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-gray-700">New Password</label>
              <input 
                type="password" 
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-[14px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-gray-700">Confirm Password</label>
              <input 
                type="password" 
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-[14px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          {pwdMessage.text && (
            <div className={`p-3 rounded-lg text-[13px] font-medium ${pwdMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
              {pwdMessage.text}
            </div>
          )}
          <div>
            <button type="submit" disabled={isUpdatingPwd} className="rounded-lg bg-blue-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
              {isUpdatingPwd ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm">
        <h3 className="font-bold text-[#0f172a] text-[18px] mb-2">Two-Factor Authentication (2FA)</h3>
        <p className="text-[14px] text-gray-500 mb-6">Enhance your account security using an Authenticator app (like Google Authenticator).</p>
        
        {isMfaEnrolled ? (
          <div className="flex items-center gap-4 bg-green-50 rounded-xl p-4 border border-green-100">
             <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
             </div>
             <div>
               <h4 className="text-[15px] font-bold text-green-800">2FA is Enabled</h4>
               <p className="text-[13px] text-green-700 mt-0.5">Your account is protected by multi-factor authentication.</p>
             </div>
          </div>
        ) : mfaSetup ? (
          <div className="flex flex-col md:flex-row gap-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
             <div className="flex flex-col items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100 min-w-[200px]">
               <div className="w-[200px] h-[200px] flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                 <img 
                   src={`data:image/svg+xml;utf-8,${encodeURIComponent(mfaSetup.qrCode.replace(/^data:image\/svg\+xml;utf-8,/, ''))}`} 
                   alt="2FA QR Code" 
                   className="w-full h-full object-contain" 
                 />
               </div>
               <span className="text-[13px] font-mono text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg select-all text-center w-full break-all border border-gray-200">
                 {mfaSetup.secret}
               </span>
             </div>
             <div className="flex flex-col gap-4 flex-1 justify-center">
               <h4 className="text-[15px] font-bold text-gray-900">Scan this QR Code</h4>
               <p className="text-[13px] text-gray-600">Open your authenticator app and scan the code. Enter the 6-digit pin generated by the app below.</p>
               <div className="flex gap-3 mt-2">
                 <input 
                   type="text"
                   placeholder="123456"
                   maxLength={6}
                   value={totpCode}
                   onChange={(e) => setTotpCode(e.target.value)}
                   className="w-32 rounded-lg border border-gray-300 px-4 py-2 text-[15px] font-mono text-center tracking-widest focus:border-blue-500 focus:outline-none"
                 />
                 <button onClick={verifyMfaSetup} className="rounded-lg bg-gray-900 px-5 py-2 text-[14px] font-semibold text-white hover:bg-black transition-colors">Verify</button>
               </div>
               {mfaMessage.text && <p className={`text-[13px] ${mfaMessage.type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>{mfaMessage.text}</p>}
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4">
            <button onClick={startMfaSetup} className="rounded-lg bg-gray-900 px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-black transition-colors">
              Setup Authenticator App
            </button>
            {mfaMessage.text && <p className={`text-[13px] ${mfaMessage.type === 'error' ? 'text-red-500 font-medium' : 'text-blue-500'}`}>{mfaMessage.text}</p>}
          </div>
        )}
      </div>

      {/* Session Management & Export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm flex flex-col items-start gap-4">
          <div>
            <h3 className="font-bold text-[#0f172a] text-[16px]">Active Sessions</h3>
            <p className="text-[13px] text-gray-500 mt-1">Logged in on a public computer? Sign out of all other remote sessions immediately.</p>
          </div>
          <button onClick={handleLogoutOthers} className="mt-auto items-center flex gap-2 rounded-lg bg-orange-50 px-4 py-2 text-[13px] font-semibold text-orange-700 hover:bg-orange-100 transition-colors">
            Log out of all devices
          </button>
        </div>
        
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm flex flex-col items-start gap-4">
          <div>
            <h3 className="font-bold text-[#0f172a] text-[16px]">Export My Data</h3>
            <p className="text-[13px] text-gray-500 mt-1">Download all your transaction history in a raw CSV format.</p>
          </div>
          <button onClick={handleExportData} className="mt-auto items-center flex gap-2 rounded-lg bg-blue-50 px-4 py-2 text-[13px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
            Download CSV
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-[20px] border border-red-200 bg-red-50 p-7 shadow-sm mt-4">
        <h3 className="font-bold text-red-900 text-[18px] mb-2">Danger Zone</h3>
        <p className="text-[14px] text-red-700 mb-6 font-medium">Permanently delete your account and all financial data. This action cannot be undone.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder='Type "DELETE" to confirm'
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-red-300 px-4 py-2.5 text-[14px] text-red-900 bg-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <button 
            disabled={deleteConfirm !== 'DELETE' || isDeleting}
            onClick={handleDeleteAccount}
            className="rounded-xl bg-red-600 px-6 py-2.5 text-[14px] font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-all shrink-0"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>

    </div>
  )
}
