import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Account } from '@motrac/shared'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch data
  const { data: rawAccounts } = await supabase
    .from('accounts')
    .select('*')
    .order('name');
  
  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select('*, account:accounts(name)')
    .order('date', { ascending: false })
    .limit(5);
  
  const accounts: Account[] = rawAccounts || [];
  const transactions = rawTransactions || [];
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header Hero Card */}
      <section className="mb-6 rounded-xl bg-[var(--primary)] p-6 shadow-md shadow-blue-200">
        <h2 className="text-sm font-medium text-white/80">Total Balance</h2>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white tracking-tight">{formatter.format(totalBalance)}</span>
        </div>
        <div className="mt-4 flex gap-4 text-sm text-white/90 overflow-x-auto scrollbar-none">
          {accounts.length > 0 ? accounts.map(acc => (
            <div key={acc.id} className="whitespace-nowrap">
              {acc.name}: <span className="font-semibold">{formatter.format(Number(acc.balance))}</span>
            </div>
          )) : (
            <div className="italic text-white/70">No accounts yet. Click + to add one.</div>
          )}
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
            {transactions.length > 0 ? transactions.map((txn) => {
              const isIncome = txn.type === 'income';
              const sign = isIncome ? '+' : (txn.type === 'expense' ? '-' : '');
              const amountLabel = `${sign}${formatter.format(Number(txn.amount))}`;
              const icon = txn.type === 'income' ? '💰' : (txn.type === 'expense' ? '💸' : '🔄');
              const accountName = txn.account?.name || 'Unknown Account';
              
              return (
                <div key={txn.id} className="group flex items-center justify-between py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
                      {icon}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--foreground)]">{txn.description || txn.type}</div>
                      <div className="text-xs text-gray-500">{accountName} • {new Date(txn.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={`font-medium ${isIncome ? 'text-green-600' : 'text-[var(--foreground)]'}`}>
                    {amountLabel}
                  </div>
                </div>
              );
            }) : (
              <div className="py-8 text-center text-sm text-gray-500">No transactions found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
