import { login, signup } from './actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Sign In | Motrac',
  description: 'Sign in to your Motrac account to manage your finances intelligently.',
}

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col items-start justify-between p-12 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[360px] h-[360px] rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/20">
            M
          </div>
          <span className="text-white font-bold text-[22px] tracking-tight">Motrac</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-[440px]">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/80 text-[13px] font-medium">Smart Financial Tracking</span>
          </div>
          <h1 className="text-[44px] font-bold text-white leading-[1.15] tracking-tight mb-5">
            Take control of your finances, today.
          </h1>
          <p className="text-white/70 text-[17px] leading-relaxed mb-8">
            Track every expense, plan your budget, and let AI guide you to your financial goals.
          </p>
          
          {/* Feature Chips */}
          <div className="flex flex-wrap gap-3">
            {['💡 AI Advisor', '📊 Smart Budgets', '🧾 Expense Tracking', '🔒 Secure'].map(f => (
              <span key={f} className="bg-white/10 border border-white/15 text-white/80 text-[13px] font-medium px-4 py-1.5 rounded-full backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 flex items-center gap-8">
          {[['100%', 'Private & Secure'], ['AI', 'Powered Insights'], ['0', 'Hidden Fees']].map(([val, label]) => (
            <div key={label}>
              <div className="text-white font-bold text-[22px]">{val}</div>
              <div className="text-white/60 text-[13px] font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        {/* Mobile Logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            M
          </div>
          <span className="text-gray-900 font-bold text-[20px] tracking-tight">Motrac</span>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 mt-1.5 text-[15px]">Sign in to your account to continue.</p>
          </div>

          {searchParams?.error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
              <svg className="text-red-500 mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="text-[13px] text-red-700 font-medium">{searchParams.error}</p>
            </div>
          )}

          {/* Google OAuth Button */}
          <form className="mb-6">
            <button
              formAction={async () => {
                "use server"
                const supabase = await createClient()
                const { data, error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`
                  }
                })
                if (data.url) redirect(data.url)
              }}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 text-[14px] font-semibold text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[13px] text-gray-400 font-medium">or continue with email</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Email/Password Form */}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                formAction={login}
                className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-[14px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
              <button
                formAction={signup}
                className="flex-1 rounded-xl border border-blue-600 bg-blue-50 px-5 py-3 text-[14px] font-bold text-blue-600 hover:bg-blue-100 transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>

          <p className="text-center text-[13px] text-gray-400 mt-8">
            By continuing, you agree to Motrac's{' '}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
