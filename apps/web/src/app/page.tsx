import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
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
          <a href="#" className="rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-[var(--primary)] text-left hover:bg-blue-100">Home</a>
          <a href="#" className="rounded-md px-4 py-2 text-sm font-medium text-[var(--foreground)] text-left opacity-80 hover:bg-gray-100">Accounts</a>
          <a href="#" className="rounded-md px-4 py-2 text-sm font-medium text-[var(--foreground)] text-left opacity-80 hover:bg-gray-100">Reports</a>
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

        <div className="mx-auto max-w-5xl">
          {/* Header Hero Card */}
          <section className="mb-6 rounded-xl bg-[var(--primary)] p-6 shadow-md shadow-blue-200">
            <h2 className="text-sm font-medium text-white/80">Total Balance</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">Rp 12.500.000</span>
            </div>
            <div className="mt-4 flex gap-4 text-sm text-white/90">
              <div>BCA: <span className="font-semibold">Rp 10.000.000</span></div>
              <div>GoPay: <span className="font-semibold">Rp 2.000.000</span></div>
              <div>Cash: <span className="font-semibold">Rp 500.000</span></div>
            </div>
          </section>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* AI Pacing Widget */}
            <div className="flex flex-col rounded-xl bg-[var(--surface)] p-6 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-[var(--foreground)]">Weekly Safe-to-Spend</h3>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Good</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Rp 850.000</div>
                  <div className="mt-1 text-sm text-gray-500">60% remaining this week</div>
                </div>
                {/* Circular indicator placeholder */}
                <div className="h-12 w-12 rounded-full border-4 border-green-500 border-l-green-100" />
              </div>
            </div>

            {/* Quick Add Templates */}
            <div className="col-span-1 flex flex-col rounded-xl bg-[var(--surface)] p-6 shadow-sm ring-1 ring-gray-100 whitespace-nowrap md:col-span-2">
              <h3 className="mb-4 font-medium text-[var(--foreground)]">Quick Add Templates</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {['☕ Coffee', '⛽ Gas', '🍱 Lunch', '🛵 Gojek'].map((t, idx) => (
                  <button key={idx} className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-gray-50 px-6 py-4 transition-all hover:border-[var(--primary)] hover:bg-blue-50 hover:shadow-sm">
                    <span className="text-xl">{t.split(' ')[0]}</span>
                    <span className="mt-2 text-sm font-medium text-[var(--foreground)]">{t.split(' ')[1]}</span>
                  </button>
                ))}
                <button className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 px-6 py-4 text-gray-400 hover:border-gray-400 hover:text-gray-500 hover:bg-gray-50">
                  <span className="text-xl">+</span>
                  <span className="mt-2 text-sm font-medium">Add New</span>
                </button>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="col-span-1 rounded-xl bg-[var(--surface)] p-6 shadow-sm ring-1 ring-gray-100 md:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-[var(--foreground)]">Recent Transactions</h3>
                <button className="text-sm font-medium text-[var(--primary)] hover:underline">View All</button>
              </div>
              <div className="flex flex-col divide-y divide-gray-100">
                {[
                  { id: 1, title: 'Starbucks', amount: '-Rp 55.000', account: 'GoPay', date: 'Today, 08:30', icon: '☕' },
                  { id: 2, title: 'Salary', amount: '+Rp 15.000.000', account: 'BCA', date: 'Yesterday', icon: '💰' },
                  { id: 3, title: 'Dinner at Sushi Tei', amount: '-Rp 350.000', account: 'BCA', date: 'Mar 20', icon: '🍣' },
                ].map((txn) => (
                  <div key={txn.id} className="group flex items-center justify-between py-3 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
                        {txn.icon}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--foreground)]">{txn.title}</div>
                        <div className="text-xs text-gray-500">{txn.account} • {txn.date}</div>
                      </div>
                    </div>
                    <div className={`font-medium ${txn.amount.startsWith('+') ? 'text-green-600' : 'text-[var(--foreground)]'}`}>
                      {txn.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile Bottom Navigation Placeholder */}
      <nav className="flex justify-around border-t border-gray-200 bg-[var(--surface)] px-2 py-3 lg:hidden pt-4 pb-6">
        <button className="flex flex-col items-center gap-1 text-[var(--primary)] text-xs font-medium">Home</button>
        <button className="flex flex-col items-center gap-1 text-gray-400 text-xs font-medium hover:text-[var(--foreground)]">Accounts</button>
        <div className="relative -mt-6">
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg shadow-blue-200 hover:opacity-90 hover:-translate-y-1 transition-all">
            +
          </button>
        </div>
        <button className="flex flex-col items-center gap-1 text-gray-400 text-xs font-medium hover:text-[var(--foreground)]">Reports</button>
        <button className="flex flex-col items-center gap-1 text-gray-400 text-xs font-medium hover:text-[var(--foreground)]">Settings</button>
      </nav>
    </div>
  )
}
