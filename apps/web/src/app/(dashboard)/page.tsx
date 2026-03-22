import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Account } from '@motrac/shared'
import { TransactionFilter } from '@/components/TransactionFilter'
import { HidableBalance } from '@/components/HidableBalance'

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ filter?: string }> | { filter?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Handle Next.js 15+ async searchParams compatibility
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};
  const filter = resolvedParams.filter || 'all';

  // Fetch data
  const { data: rawAccounts } = await supabase
    .from('accounts')
    .select('*')
    .order('name');
  
  let txQuery = supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (filter === 'income') txQuery = txQuery.eq('type', 'income');
  if (filter === 'expense') txQuery = txQuery.eq('type', 'expense');

  const { data: rawTransactions } = await txQuery.limit(5);

  const currentMonthStr = new Date().toISOString().slice(0, 7)
  
  // Calculate Pacing and Month Totals
  const { data: budget } = await supabase.from('budgets').select('*').eq('month', currentMonthStr).single()
  const { data: monthTxns } = await supabase.from('transactions').select('amount, type, category_id, date').gte('date', `${currentMonthStr}-01T00:00:00Z`)
  
  const allTxns = monthTxns || []
  const monthIncome = allTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
  const monthExpense = allTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  
  const allowableSpend = budget ? Number(budget.needs_amount) + Number(budget.wants_amount) : 0
  const remaining = allowableSpend - monthExpense
  const spentPercent = allowableSpend > 0 ? (monthExpense / allowableSpend) * 100 : 0
  
  const accounts: Account[] = rawAccounts || [];
  const transactions = rawTransactions || [];
  
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-[-0.02em]">Good afternoon{user?.user_metadata?.first_name ? `, ${user.user_metadata.first_name}` : ''}</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* === LEFT MAIN COLUMN (Span 8) === */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Total Balance Card */}
            <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-[15px] font-medium text-[#64748b] mb-2">Total Balance</h2>
                  <div className="text-[36px] font-bold text-[#0f172a] tracking-[-0.03em] leading-none mb-3">
                <HidableBalance amount={formatter.format(totalBalance).replace('Rp', '').trim()} /> <span className="text-[24px] text-gray-400">IDR</span>
              </div>
              <div className="flex items-center gap-4 text-[13px] font-semibold">
                <div className="flex items-center gap-1 text-[#16a34a]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 10H4z"/></svg>
                  <HidableBalance amount={formatter.format(totalBalance * 0.05).replace('Rp', '').trim()} />
                </div>
                <div className="flex items-center gap-1 text-[#ef4444]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l-8-10h16z"/></svg>
                  <HidableBalance amount={formatter.format(totalBalance * 0.02).replace('Rp', '').trim()} />
                </div>
              </div>
                </div>
              </div>
              <div className="flex gap-2.5 flex-wrap mt-auto pt-4">
                <Link href="/transactions" className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-blue-700 flex items-center gap-2 transition-colors">
                  + Transaction
                </Link>
                <Link href="/debts" className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Debt Record
                </Link>
                <Link href="/accounts" className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-colors hidden sm:flex">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>
                  Accounts
                </Link>
                <Link href="/reports" className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-[14px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </Link>
              </div>
            </div>

            {/* Stacked Income / Expense */}
            <div className="flex flex-col gap-5 h-full">
              <div className="flex-1 rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <h3 className="text-[14px] font-medium text-[#64748b] mb-2 z-10">Total Income</h3>
                <div className="text-[28px] font-bold text-[#0f172a] tracking-tight mb-5 z-10"><HidableBalance amount={formatter.format(monthIncome)} /></div>
                <div className="flex h-6 w-full rounded-md bg-[#F1F5F9] overflow-hidden mb-5 z-10 shadow-sm border border-[#E5E7EB]">
                   <div className="h-full bg-[#3B82F6]" style={{ width: '65%' }}></div>
                   <div className="h-full bg-[#1E3A8A]" style={{ width: '25%' }}></div>
                </div>
                <p className="text-[13px] text-[#64748b] leading-relaxed z-10 pr-4">
                  The biggest income this month is from <span className="font-semibold text-[#0f172a]">salary 84,2%</span>
                </p>
              </div>
              <div className="flex-1 rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <h3 className="text-[14px] font-medium text-[#64748b] mb-2 z-10">Total Expense</h3>
                <div className="text-[28px] font-bold text-[#0f172a] tracking-tight mb-5 z-10"><HidableBalance amount={formatter.format(monthExpense)} /></div>
                <div className="flex h-6 w-full rounded-md bg-[#F1F5F9] overflow-hidden mb-5 z-10 shadow-sm border border-[#E5E7EB]">
                   <div className="h-full bg-[#EF4444]" style={{ width: '45%' }}></div>
                   <div className="h-full bg-[#0F172A]" style={{ width: '55%' }}></div>
                </div>
                <p className="text-[13px] text-[#64748b] leading-relaxed z-10 pr-4">
                  The biggest expense this month is <span className="font-semibold text-[#EF4444]">shopping 38,2%</span>
                </p>
              </div>
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm flex-1">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h3 className="font-bold text-[#0f172a] text-[18px]">Recent Transaction</h3>
                <p className="text-[13px] text-[#64748b] mt-1.5 hidden sm:block">Transaction history for this month</p>
              </div>
              <div className="flex gap-2">
                <TransactionFilter />
              </div>
            </div>
            
            <div className="flex flex-col gap-5">
              {transactions.length > 0 ? transactions.map((txn) => {
                const isIncome = txn.type === 'income';
                const sign = isIncome ? '+' : (txn.type === 'expense' ? '-' : '');
                const amountLabel = `${sign}${formatter.format(Number(txn.amount))}`;
                const accountName = accounts.find(a => a.id === txn.account_id)?.name || 'Account';
                
                return (
                  <div key={txn.id} className="group flex items-center justify-between py-2 border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC] rounded-lg -mx-2 px-2 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#F1F5F9] border border-[#E5E7EB]/50 text-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
                        {isIncome ? '📥' : '📤'}
                      </div>
                      <div>
                        <div className="font-bold text-[#0f172a] text-[15px]">{txn.note || "Transfer"}</div>
                        <div className="text-[13px] text-[#64748b] mt-0.5 tracking-tight">{new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {accountName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="hidden sm:inline-block px-3 py-1 bg-[#DCFCE7] text-[#16A34A] text-[13px] font-bold rounded-lg shadow-sm">
                        Completed
                      </span>
                      <div className="text-right w-28">
                        <div className="font-bold text-[#0f172a] text-[15px]"><HidableBalance amount={amountLabel.replace('Rp', '').trim()} /> <span className="text-[#64748b] text-[13px]">IDR</span></div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-8 text-center text-sm text-gray-500">No transactions found.</div>
              )}
            </div>
          </div>
        </div>

        {/* === RIGHT SIDEBAR COLUMN (Span 4) === */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          
          {/* My Accounts */}
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h3 className="font-bold text-[#0f172a] text-[18px]">My Accounts</h3>
                <p className="text-[13px] text-[#64748b] mt-1.5">Connected balances</p>
              </div>
              <Link href="/accounts" className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-[13px] font-semibold text-[#475569] hover:bg-gray-50 shadow-sm transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                Add
              </Link>
            </div>
            
            <div className="flex flex-col gap-4">
              {accounts.map(acc => (
                <div key={acc.id} className="relative rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-[#E5E7EB] p-5 text-gray-800 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] flex items-center justify-between group cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                  <div className="absolute inset-0 bg-white/40 mix-blend-overlay"></div>
                  
                  <div className="flex items-center gap-4 z-10 relative">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-[#E5E7EB]/50 flex items-center justify-center text-xl">
                      {acc.icon || '🏦'}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0f172a] text-[15px]">{acc.name}</h4>
                      <div className="text-[12px] font-bold text-[#64748b] tracking-wider uppercase">{acc.type.replace('_', ' ')}</div>
                    </div>
                  </div>
                  
                  <div className="z-10 text-right relative">
                    <div className="font-bold text-[#0f172a] text-[16px]"><HidableBalance amount={formatter.format(Number(acc.balance)).replace('Rp', '').trim()} /></div>
                  </div>
                </div>
              ))}

              {accounts.length === 0 && (
                <div className="py-8 text-center border-2 border-dashed border-[#E5E7EB] rounded-[20px] text-[#64748b] text-[13px] font-semibold">
                  No accounts added yet
                </div>
              )}
            </div>
          </div>

          {/* Financial Planning / AI Pacing */}
          <div className="p-8 rounded-[20px] shadow-sm text-white relative overflow-hidden bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#3B82F6] flex flex-col min-h-[220px]">
             <div className="relative z-10">
               <div className="text-[13px] font-medium text-[#93C5FD] mb-2 tracking-wide">Financial planning</div>
               <h3 className="text-[24px] font-bold tracking-tight leading-[1.15] mb-3 pr-8">Plan, budget and<br />forecast.</h3>
               <Link href="/reports" className="inline-block rounded-lg bg-[#111827] hover:bg-black px-5 py-2.5 text-[14px] font-semibold transition-colors shadow-sm mt-4">
                 Get Report
               </Link>
             </div>
             
             {/* Dial chart decoration at bottom right */}
             <div className="absolute -bottom-8 -right-8 w-64 h-64 z-0 pointer-events-none">
               {/* Concentric circles */}
               <div className="absolute inset-0 rounded-full border-[10px] border-white/5" />
               <div className="absolute inset-6 rounded-full border-[10px] border-white/10" />
               <div className="absolute inset-12 rounded-full border-[10px] border-white/20 border-t-[#60A5FA] border-r-[#60A5FA] transform rotate-45" />
               
               {/* Stats inside the dial */}
               <div className="absolute inset-0 flex flex-col items-center justify-center -translate-x-4 -translate-y-4">
                 <div className="text-[24px] font-bold tracking-tight">
                   {budget ? `${(100 - spentPercent).toFixed(2)}%` : 'No'}
                 </div>
                 <div className="text-[11px] font-medium text-[#93C5FD] uppercase tracking-wider mt-1">
                   Budget Remaining
                 </div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
