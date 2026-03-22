import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Transaction } from '@motrac/shared'
import { AddTransactionModal } from '../../../components/AddTransactionModal'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch Accounts and Categories for the Form
  const { data: accounts } = await supabase.from('accounts').select('*').order('name')
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  // Fetch Transaction History
  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
  
  const transactions = rawTransactions || []
  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-[-0.02em]">Transactions</h1>
        {accounts && accounts.length > 0 && (
          <AddTransactionModal accounts={accounts} categories={categories || []} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Transaction History */}
        <div className="flex flex-col rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm">
          <h3 className="font-bold text-[#0f172a] text-[18px] mb-6">History</h3>
          <div className="flex flex-col divide-y divide-gray-100">
            {transactions.length > 0 ? transactions.map((txn) => {
              const isIncome = txn.type === 'income'
              const sign = isIncome ? '+' : (txn.type === 'expense' ? '-' : '')
              const amountLabel = `${sign}${formatter.format(Number(txn.amount))}`
              const accountName = accounts?.find(a => a.id === txn.account_id)?.name || 'Unknown Account'
              const categoryName = categories?.find(c => c.id === txn.category_id)?.name || 'Uncategorized'
              
              const iconIncome = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>
              const iconExpense = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"></path></svg>
              const iconTransfer = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="21" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
              const renderIcon = isIncome ? iconIncome : (txn.type === 'expense' ? iconExpense : iconTransfer)

              return (
                <div key={txn.id} className="group flex items-center justify-between py-3 border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC] rounded-lg -mx-2 px-3 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-[#F8FAFC] border border-[#E5E7EB]/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                      {renderIcon}
                    </div>
                    <div>
                      <div className="font-bold text-[#0f172a] text-[15px]">{txn.note || categoryName}</div>
                      <div className="text-[13px] text-[#64748b] mt-0.5 tracking-tight">{new Date(txn.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} • {accountName}</div>
                    </div>
                  </div>
                  <div className={`font-bold text-[15px] ${isIncome ? 'text-[#16A34A]' : 'text-[#0f172a]'}`}>
                    {amountLabel}
                  </div>
                </div>
              )
            }) : (
              <div className="py-8 text-center text-sm text-gray-500">No transactions found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
