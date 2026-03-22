import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BalanceProvider } from '@/components/BalanceContext'
import { HeaderActions } from '@/components/HeaderActions'
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <BalanceProvider>
    <div className="flex h-screen w-full flex-col bg-[var(--background)] lg:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-[260px] flex-col border-r border-[#E5E7EB] bg-white p-6 pb-6 lg:flex print:hidden relative">
        <div className="mb-10 flex items-center">
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900 tracking-tight">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 4H10C6.68629 4 4 6.68629 4 10V14C4 17.3137 6.68629 20 10 20H14C17.3137 20 20 17.3137 20 14V10C20 6.68629 17.3137 4 14 4Z" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 4L10 20" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[20px] font-extrabold tracking-[-0.03em] text-[#0f172a]">p̄ayland</span>
          </div>
          <button className="ml-auto text-gray-400">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5 print:hidden">
          <Link href="/" className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-[#2563EB] bg-[#EFF6FF] flex items-center gap-3">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-100"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
             Dashboard
          </Link>
          <Link href="/transactions" className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#475569] hover:bg-gray-50 flex items-center gap-3">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
             Transactions
          </Link>
          <Link href="/debts" className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#475569] hover:bg-gray-50 flex items-center gap-3">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
             Payments
          </Link>
          <Link href="/reports" className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#475569] hover:bg-gray-50 flex items-center gap-3">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
             Reports
          </Link>
          <Link href="/accounts" className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#475569] hover:bg-gray-50 flex items-center gap-3">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
             Accounts
          </Link>
          
          <div className="flex-1"></div>
          
          <Link href="/budgets" className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#475569] hover:bg-gray-50 flex items-center gap-3">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
             Settings
          </Link>
          <button className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#475569] hover:bg-gray-50 flex items-center gap-3 text-left">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
             Help & Support
          </button>
        </nav>

        <div className="mt-8 pt-4 print:hidden">
          {/* Promo Card that looks exactly like reference */}
          <div className="relative rounded-[20px] border border-[#E5E7EB] bg-white pt-[50px] overflow-hidden text-center shadow-sm">
             <div className="absolute -top-[60px] left-1/2 -translate-x-1/2 w-48 h-32 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB]/50 flex items-end justify-center pb-4 shadow-sm">
                <div className="w-32 h-20 bg-white rounded-t-xl border border-[#E5E7EB] shadow-[0_4px_10px_rgba(0,0,0,0.02)] pt-2 px-3">
                   <div className="w-6 h-4 bg-yellow-400 rounded-[2px]" />
                </div>
             </div>
             
             <div className="px-4 pb-4 bg-white relative z-10">
               <h3 className="text-[15px] font-bold text-gray-900 leading-tight mb-4">Accept credit cards and bank payments</h3>
               <button className="w-full rounded-[10px] bg-[#2563EB] py-2.5 text-[13px] font-semibold text-white hover:bg-blue-700 transition-colors">
                 Set up now
               </button>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col bg-[#F9FAFB]">
        {/* Top Header Row */}
        <header className="hidden lg:flex items-center justify-end px-8 bg-white border-b border-[#E5E7EB] print:hidden h-[72px]">
          <div className="flex items-center gap-3">
            <HeaderActions />
            <div className="h-10 w-10 ml-2 rounded-full bg-gradient-to-tr from-gray-700 to-black overflow-hidden shadow-sm" >
               <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-6 lg:pt-8 print:p-0 print:overflow-visible">
          <header className="mb-8 flex items-center justify-between lg:hidden print:hidden">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md text-blue-600 bg-blue-100 text-center font-bold leading-8">M</div>
              <h1 className="ml-3 text-xl font-bold text-[var(--primary)]">Motrac</h1>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-200" />
          </header>

          {children}
        </main>
      
        {/* Mobile Bottom Navigation */}
        <nav className="flex justify-around border-t border-gray-200 bg-[var(--surface)] px-2 py-3 lg:hidden pt-4 pb-6 print:hidden">
          <Link href="/" className="flex flex-col items-center gap-1 text-[var(--foreground)] text-xs font-medium opacity-80">Home</Link>
          <Link href="/accounts" className="flex flex-col items-center gap-1 text-[var(--foreground)] text-xs font-medium opacity-80 hover:text-[var(--primary)]">Accounts</Link>
          <div className="relative -mt-6">
            <Link href="/transactions" className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg shadow-blue-200 hover:opacity-90 hover:-translate-y-1 transition-all">
              +
            </Link>
          </div>
          <Link href="/budgets" className="flex flex-col items-center gap-1 text-[var(--foreground)] text-xs font-medium opacity-80 hover:text-[var(--primary)]">Budgets</Link>
          <Link href="/reports" className="flex flex-col items-center gap-1 text-[var(--foreground)] text-xs font-medium opacity-80 hover:text-[var(--primary)]">Reports</Link>
        </nav>
      </div>
    </div>
    </BalanceProvider>
  )
}
