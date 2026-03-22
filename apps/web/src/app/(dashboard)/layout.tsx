import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BalanceProvider } from '@/components/BalanceContext'
import { HeaderActions } from '@/components/HeaderActions'
import { Sidebar } from '@/components/Sidebar'

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
      <Sidebar />

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
              <div className="h-8 w-8 rounded-md text-white bg-blue-600 text-center font-bold leading-8">M</div>
              <h1 className="ml-3 text-xl font-black text-blue-600 tracking-[0.05em]">MOTRAC</h1>
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
