import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
    <div className="flex h-screen w-full flex-col bg-[var(--background)] lg:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-[var(--surface)] p-4 shadow-sm lg:flex">
        <div className="mb-8 flex items-center px-2 pt-2">
          <div className="h-8 w-8 rounded-md bg-[var(--primary)] text-center font-bold leading-8 text-white">M</div>
          <h1 className="ml-3 text-xl font-bold text-[var(--primary)]">Motrac</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          <Link href="/" className="rounded-md px-4 py-2 text-sm font-medium text-[var(--foreground)] text-left opacity-80 hover:bg-gray-100">Home</Link>
          <Link href="/accounts" className="rounded-md px-4 py-2 text-sm font-medium text-[var(--foreground)] text-left opacity-80 hover:bg-gray-100">Accounts</Link>
          <Link href="/transactions" className="rounded-md px-4 py-2 text-sm font-medium text-[var(--foreground)] text-left opacity-80 hover:bg-gray-100">Transactions</Link>
          <a href="#" className="rounded-md px-4 py-2 text-sm font-medium text-[var(--foreground)] text-left opacity-80 hover:bg-gray-100">Settings</a>
        </nav>
        <div className="mt-auto border-t border-gray-100 pt-4">
          <div className="truncate px-2 text-xs text-gray-500">{user.email}</div>
          <form action="/auth/signout" method="post">
            <button className="mt-2 w-full rounded-md px-2 py-2 text-left text-sm text-red-500 hover:bg-red-50">Sign Out</button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="mb-8 flex items-center justify-between lg:hidden">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-[var(--primary)] text-center font-bold leading-8 text-white">M</div>
            <h1 className="ml-3 text-xl font-bold text-[var(--primary)]">Motrac</h1>
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-200" />
        </header>

        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="flex justify-around border-t border-gray-200 bg-[var(--surface)] px-2 py-3 lg:hidden pt-4 pb-6">
        <Link href="/" className="flex flex-col items-center gap-1 text-[var(--foreground)] text-xs font-medium opacity-80">Home</Link>
        <Link href="/accounts" className="flex flex-col items-center gap-1 text-[var(--foreground)] text-xs font-medium opacity-80 hover:text-[var(--primary)]">Accounts</Link>
        <div className="relative -mt-6">
          <Link href="/transactions" className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg shadow-blue-200 hover:opacity-90 hover:-translate-y-1 transition-all">
            +
          </Link>
        </div>
        <Link href="/transactions" className="flex flex-col items-center gap-1 text-[var(--foreground)] text-xs font-medium opacity-80 hover:text-[var(--primary)]">History</Link>
        <button className="flex flex-col items-center gap-1 text-[var(--foreground)] text-xs font-medium opacity-80 hover:text-[var(--primary)]">Settings</button>
      </nav>
    </div>
  )
}
