'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function MFAPage() {
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      // If no MFA is needed, or they are already verified, redirect to dashboard
      if (data?.nextLevel === 'aal1' || data?.currentLevel === 'aal2') {
        router.push('/')
      }
    })
  }, [router, supabase])

  const onSubmitClicked = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const factors = await supabase.auth.mfa.listFactors()
      if (factors.error) throw factors.error

      const totpFactor = factors.data.totp[0]
      if (!totpFactor) throw new Error('No 2FA factors found for this account!')

      const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id })
      if (challenge.error) throw challenge.error

      const verify = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.data.id,
        code: verifyCode,
      })
      if (verify.error) throw verify.error

      // Must refresh the session so that the JWT reflects aal2
      await supabase.auth.refreshSession()
      
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F9FAFB]">
      <div className="w-full max-w-[420px] rounded-[24px] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-900/5">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h1 className="text-[24px] font-bold text-gray-900 tracking-[-0.02em]">Two-Factor Verification</h1>
          <p className="mt-2 text-[14px] text-gray-500 leading-relaxed px-4">
            Enter the 6-digit code from your authenticator app to access your Motrac account.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-[13px] font-medium text-red-700 border border-red-100 flex items-start gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}

        <form onSubmit={onSubmitClicked} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              required
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0 0 0 0 0 0"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-[22px] font-mono tracking-[0.5em] text-center outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-gray-300"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || verifyCode.length !== 6}
            className="w-full rounded-xl bg-blue-600 p-3.5 text-[15px] font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex justify-center items-center h-[52px]"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : 'Verify Identity'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <button onClick={handleSignOut} className="text-[13px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">
            Cancel & Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
