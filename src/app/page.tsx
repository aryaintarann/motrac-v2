import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Motrac | Take Control of Your Finances',
  description: 'Track every expense, plan your budget, and let AI guide you to your financial goals.',
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is already logged in, they probably just went to the root domain. Move them to dashboard.
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-[#E5E7EB]/50 bg-white/80 px-6 backdrop-blur-lg sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--primary)] text-xl font-black text-white shadow-sm shrink-0">
            M
          </div>
          <span className="text-[22px] font-black tracking-[0.05em] text-[var(--primary)] whitespace-nowrap">
            MOTRAC
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-gray-600">
          <a href="#features" className="hover:text-[var(--primary)] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[var(--primary)] transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-[var(--primary)] transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-[15px] font-semibold text-gray-600 hover:text-[var(--primary)] transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-[14px] font-bold text-white shadow-[0_4px_14px_0_rgba(26,111,214,0.39)] hover:bg-[#155ab0] hover:shadow-[0_6px_20px_rgba(26,111,214,0.23)] hover:-translate-y-0.5 transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-white pt-24 pb-32 sm:pt-32 sm:pb-40">
          {/* Background decorations */}
          <div className="absolute top-1/4 left-1/2 -z-10 w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-30">
            <div className="aspect-[1/1] w-full rounded-full bg-gradient-to-tr from-[#1A6FD6] to-[#2196F3] blur-[120px]"></div>
          </div>
          
          <div className="container mx-auto px-6 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              <span className="text-[13px] font-bold text-blue-700 uppercase tracking-widest">Motrac 2.0 is here</span>
            </div>
            
            <h1 className="mx-auto max-w-4xl text-[50px] font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-[64px] lg:text-[76px]">
              Take Control of <br className="hidden sm:block" /> Your Finances.
            </h1>
            
            <p className="mx-auto mt-8 max-w-2xl text-[18px] leading-relaxed text-gray-500 sm:text-[20px]">
              Track every expense, plan your budget, and let AI guide you to your financial goals. Motrac brings clarity to your personal wealth in one beautiful dashboard.
            </p>
            
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="w-full sm:w-auto rounded-2xl bg-[var(--primary)] px-8 py-4 text-[16px] font-bold text-white shadow-[0_4px_14px_0_rgba(26,111,214,0.39)] hover:bg-[#155ab0] hover:shadow-[0_6px_20px_rgba(26,111,214,0.23)] hover:-translate-y-0.5 transition-all">
                Start for free
              </Link>
              <Link href="#features" className="w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-8 py-4 text-[16px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all">
                Explore features
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-[var(--background)] py-24 sm:py-32">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-[32px] font-bold tracking-tight text-gray-900 sm:text-[40px]">
                Everything you need to grow your wealth.
              </h2>
              <p className="mt-4 text-[18px] text-gray-500">
                Powerful tools wrapped in a stunning, easy-to-use interface.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              
              {/* Feature 1 */}
              <div className="group relative rounded-[24px] border border-[#E5E7EB] bg-white p-8 shadow-sm transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[14px] bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <h3 className="mb-3 text-[18px] font-bold text-gray-900">Accounts Tracking</h3>
                <p className="text-[15px] leading-relaxed text-gray-500">
                  Visualize all your cash, bank accounts, and e-wallets in one unified dashboard.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative rounded-[24px] border border-[#E5E7EB] bg-white p-8 shadow-sm transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[14px] bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
                </div>
                <h3 className="mb-3 text-[18px] font-bold text-gray-900">Smart Budgets</h3>
                <p className="text-[15px] leading-relaxed text-gray-500">
                  Set limits to your spending. Track your weekly and monthly paces gracefully.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative rounded-[24px] border border-[#E5E7EB] bg-white p-8 shadow-sm transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[14px] bg-red-50 text-red-600 transition-colors group-hover:bg-red-100">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
                </div>
                <h3 className="mb-3 text-[18px] font-bold text-gray-900">Debt Management</h3>
                <p className="text-[15px] leading-relaxed text-gray-500">
                  Keep a close eye on who owes you and whom you owe. Never forget a payment.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group relative rounded-[24px] border border-[#E5E7EB] bg-white p-8 shadow-sm transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[14px] bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                </div>
                <h3 className="mb-3 text-[18px] font-bold text-gray-900">AI Advisor</h3>
                <p className="text-[15px] leading-relaxed text-gray-500">
                  Get personalized, AI-driven insights on your spending habit and save more effectively.
                </p>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--primary)] text-[14px] font-black text-white">
              M
            </div>
            <span className="text-[18px] font-black tracking-[0.05em] text-gray-900">
              MOTRAC
            </span>
          </div>
          <p className="text-[14px] text-gray-500">
            © {new Date().getFullYear()} Motrac. All rights reserved.
          </p>
          <div className="flex divide-x divide-gray-300 text-[14px] font-medium text-gray-500">
             <Link href="#" className="px-4 hover:text-gray-900 transition-colors">Privacy</Link>
             <Link href="#" className="px-4 hover:text-gray-900 transition-colors">Terms</Link>
             <Link href="#" className="px-4 hover:text-gray-900 transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
