import { signup } from './actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LoginRedirectHandler } from '@/components/LoginRedirectHandler'

export const metadata = {
  title: 'Create Account | Motrac',
  description: 'Create your free Motrac account and start managing your finances intelligently.',
}

export default async function SignUpPage(props: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Note: Middleware handles redirecting logged-in users
  // This check is just for safety in case middleware doesn't run
  if (user && !searchParams?.next) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <LoginRedirectHandler />
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col items-start justify-between p-12 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[360px] h-[360px] rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white font-black text-[#2563EB] text-xl shadow-sm shrink-0">
            M
          </div>
          <span className="text-[22px] font-black tracking-[0.05em] text-white whitespace-nowrap">MOTRAC</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-[440px]">
          <h1 className="text-[44px] font-bold text-white leading-[1.15] tracking-tight mb-5">
            Your financial journey starts here.
          </h1>
          <p className="text-white/70 text-[17px] leading-relaxed">
            Join thousands of users who track every expense, plan smarter budgets, and reach their financial goals with AI-powered insights.
          </p>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 flex items-center gap-8">
          {[['Free', 'Forever'], ['AI', 'Powered'], ['100%', 'Private']].map(([val, label]) => (
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
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#2563EB] font-black text-white text-xl shadow-sm shrink-0">
            M
          </div>
          <span className="text-[22px] font-black tracking-[0.05em] text-[#2563EB] whitespace-nowrap">MOTRAC</span>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-gray-900 tracking-tight">Create your account</h2>
            <p className="text-gray-500 mt-1.5 text-[15px]">
              Already have one?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          {searchParams?.error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
              <svg className="text-red-500 mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="text-[13px] text-red-700 font-medium">{searchParams.error}</p>
            </div>
          )}

          {/* Google OAuth */}
          <form className="mb-6">
            {searchParams?.next && (
              <input type="hidden" name="next" value={searchParams.next} />
            )}
            <button
              formAction={async (formData: FormData) => {
                "use server"
                const next = formData.get('next') as string | null
                const supabase = await createClient()
                const { data } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`
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
              </svg>
              Sign up with Google
            </button>
          </form>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[13px] text-gray-400 font-medium">or with email</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Signup Form */}
          <form className="flex flex-col gap-4">
            {searchParams?.next && (
              <input type="hidden" name="next" value={searchParams.next} />
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700" htmlFor="full_name">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
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
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Min. 6 characters"
              />
            </div>

            <button
              formAction={signup}
              className="w-full mt-2 rounded-xl bg-blue-600 px-5 py-3 text-[14px] font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-[13px] text-gray-400 mt-8">
            By signing up, you agree to Motrac's{' '}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
