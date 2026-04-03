import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Account } from '@/shared'
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
  const { data: budget } = await supabase.from('budgets').select('*').like('month', `${currentMonthStr}%`).limit(1).maybeSingle()
  const { data: monthTxns } = await supabase
    .from('transactions')
    .select('amount, type, category_id, date, categories(budget_type)')
    .gte('date', `${currentMonthStr}-01T00:00:00Z`)
  
  const allTxns = monthTxns || []
  const monthIncome = allTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
  const monthExpense = allTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)

  // Per-category spending
  const spentNeeds = allTxns.filter(t => t.type === 'expense' && (t.categories as any)?.budget_type === 'needs').reduce((sum, t) => sum + Number(t.amount), 0)
  const spentWants = allTxns.filter(t => t.type === 'expense' && (t.categories as any)?.budget_type === 'wants').reduce((sum, t) => sum + Number(t.amount), 0)
  const spentSavings = allTxns.filter(t => t.type === 'expense' && (t.categories as any)?.budget_type === 'savings').reduce((sum, t) => sum + Number(t.amount), 0)

  const budgetNeeds = budget ? Number(budget.needs_amount) : 0
  const budgetWants = budget ? Number(budget.wants_amount) : 0
  const budgetSavings = budget ? Number(budget.savings_amount) : 0
  const budgetDebt = budget ? Number(budget.debt_amount ?? 0) : 0

  const allowableSpend = budgetNeeds + budgetWants
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
          
          {/* Top Metrics Row — 4 cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Card 1: Total Balance */}
            <div className="col-span-2 xl:col-span-2 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[13px] font-medium text-[#64748b] mb-1">Total Balance</p>
                  <div className="text-[30px] font-bold text-[#0f172a] tracking-[-0.03em] leading-none flex items-baseline gap-2">
                    <HidableBalance amount={formatter.format(totalBalance).replace('Rp', '').trim()} />
                    <span className="text-[16px] font-semibold text-gray-400">IDR</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap mt-4">
                <Link href="/dashboard/transactions" className="rounded-lg bg-[#2563EB] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-blue-700 flex items-center gap-1.5 transition-colors">
                  + Transaction
                </Link>
                <Link href="/dashboard/debts" className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Debt
                </Link>
                <Link href="/dashboard/accounts" className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="2"/></svg>
                  Accounts
                </Link>
                <Link href="/dashboard/reports" className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[#475569] shadow-sm transition-colors hover:bg-gray-50">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </Link>
              </div>
            </div>

            {/* Card 2: Income + Expense Combined */}
            <div className="col-span-2 xl:col-span-2 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-sm flex flex-col gap-3">
              <p className="text-[13px] font-medium text-[#64748b]">This Month</p>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Income</div>
                  <div className="text-[22px] font-bold text-[#0f172a] tracking-[-0.02em] leading-none">
                    <HidableBalance amount={formatter.format(monthIncome).replace('Rp\xa0', '+Rp ')} />
                  </div>
                </div>
                <div className="h-10 w-px bg-gray-100" />
                <div>
                  <div className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-1">Expense</div>
                  <div className="text-[22px] font-bold text-[#0f172a] tracking-[-0.02em] leading-none">
                    <HidableBalance amount={formatter.format(monthExpense).replace('Rp\xa0', '-Rp ')} />
                  </div>
                </div>
              </div>
              {/* Stacked bar */}
              <div className="flex h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden mt-1">
                {(monthIncome + monthExpense) > 0 && (
                  <>
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(monthIncome / (monthIncome + monthExpense)) * 100}%` }} />
                    <div className="h-full bg-red-400 transition-all" style={{ width: `${(monthExpense / (monthIncome + monthExpense)) * 100}%` }} />
                  </>
                )}
              </div>
              <p className="text-[12px] text-[#64748b]">
                Net: <span className={`font-bold ${monthIncome - monthExpense >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {formatter.format(monthIncome - monthExpense)}
                </span>
              </p>
            </div>

            {/* Card 3: Budget Remaining — per category */}
            <div className="col-span-2 xl:col-span-2 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <p className="text-[13px] font-medium text-[#64748b]">Budget Remaining</p>
                {budget && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${remaining >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {(100 - Math.min(spentPercent, 100)).toFixed(0)}% left
                  </span>
                )}
              </div>

              {budget ? (
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Needs', budget: budgetNeeds, spent: spentNeeds, color: 'bg-blue-500' },
                    { label: 'Wants', budget: budgetWants, spent: spentWants, color: 'bg-purple-500' },
                    { label: 'Savings', budget: budgetSavings, spent: spentSavings, color: 'bg-emerald-500' },
                    ...(budgetDebt > 0 ? [{ label: 'Debt', budget: budgetDebt, spent: 0, color: 'bg-red-400' }] : [])
                  ].map(({ label, budget: bgt, spent, color }) => {
                    const pct = bgt > 0 ? Math.min((spent / bgt) * 100, 100) : 0
                    const rem = bgt - spent
                    return (
                      <div key={label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[12px] font-semibold text-gray-600">{label}</span>
                          <span className={`text-[12px] font-bold ${rem >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
                            {formatter.format(rem)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-400' : color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[22px] font-bold text-gray-300">—</span>
                  <Link href="/dashboard/budgets" className="text-[12px] text-blue-600 font-semibold hover:underline">Set budget →</Link>
                </div>
              )}
            </div>

            {/* Card 4: Weekly Pace with Rollover (Needs & Wants) */}
            {(() => {
              const today = new Date()
              const dayOfMonth = today.getDate()
              const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
              const weekNumber = Math.ceil(dayOfMonth / 7)
              const weeksInMonth = daysInMonth / 7
              
              // Needs setup
              const budgetNeedsPerWeek = budgetNeeds > 0 ? budgetNeeds / weeksInMonth : 0
              const needsAllocatedSoFar = budgetNeedsPerWeek * weekNumber
              const needsRemainingThisWeek = needsAllocatedSoFar - spentNeeds
              
              const needsPct = needsAllocatedSoFar > 0 ? Math.min((spentNeeds / needsAllocatedSoFar) * 100, 100) : 0
              
              // Wants setup
              const budgetWantsPerWeek = budgetWants > 0 ? budgetWants / weeksInMonth : 0
              const wantsAllocatedSoFar = budgetWantsPerWeek * weekNumber
              const wantsRemainingThisWeek = wantsAllocatedSoFar - spentWants
              
              const wantsPct = wantsAllocatedSoFar > 0 ? Math.min((spentWants / wantsAllocatedSoFar) * 100, 100) : 0

              return (
                <div className="col-span-1 xl:col-span-2 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-[13px] font-medium text-[#64748b]">Weekly Pace (Rollover)</p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      Week {weekNumber}
                    </span>
                  </div>

                  {budget ? (
                    <div className="flex flex-col gap-4">
                      {/* Needs Weekly Pace */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[12px] font-semibold text-gray-600">Needs Remaining</span>
                          <span className={`text-[12px] font-bold ${needsRemainingThisWeek >= 0 ? 'text-[#0f172a]' : 'text-red-500'}`}>
                            {formatter.format(needsRemainingThisWeek)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${needsPct > 90 ? 'bg-red-500' : needsPct > 70 ? 'bg-amber-400' : 'bg-blue-500'}`}
                            style={{ width: `${needsPct}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 font-medium">Safe to spend: {formatter.format(budgetNeedsPerWeek)} / week</div>
                      </div>
                      
                      {/* Wants Weekly Pace */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[12px] font-semibold text-gray-600">Wants Remaining</span>
                          <span className={`text-[12px] font-bold ${wantsRemainingThisWeek >= 0 ? 'text-[#0f172a]' : 'text-red-500'}`}>
                            {formatter.format(wantsRemainingThisWeek)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${wantsPct > 90 ? 'bg-red-500' : wantsPct > 70 ? 'bg-amber-400' : 'bg-purple-500'}`}
                            style={{ width: `${wantsPct}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 font-medium">Safe to spend: {formatter.format(budgetWantsPerWeek)} / week</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-2">
                       <span className="text-[22px] font-bold text-gray-300">—</span>
                       <Link href="/dashboard/budgets" className="text-[12px] text-blue-600 font-semibold hover:underline">Set budget →</Link>
                    </div>
                  )}
                </div>
              )
            })()}

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
              <Link href="/dashboard/accounts" className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-[13px] font-semibold text-[#475569] hover:bg-gray-50 shadow-sm transition-colors">
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
             <div className="relative z-10 w-full sm:w-4/5">
               <div className="text-[13px] font-medium text-[#93C5FD] mb-2 tracking-wide">Financial planning</div>
               <h3 className="text-[24px] font-bold tracking-tight leading-[1.15] mb-3 pr-8">Plan, budget and<br />forecast.</h3>
               <Link href="/dashboard/reports" className="inline-block rounded-lg bg-[#111827] hover:bg-black px-5 py-2.5 text-[14px] font-semibold transition-colors shadow-sm mt-4">
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
