import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Transaction } from '@motrac/shared'
import { TransactionForm } from '../../../components/TransactionForm'

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
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-[-0.02em]">Transactions</h1>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Transaction History */}
        <div className="xl:col-span-8 flex flex-col rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm">
          <h3 className="font-bold text-[#0f172a] text-[18px] mb-6">History</h3>
          <div className="flex flex-col divide-y divide-gray-100">
            {transactions.length > 0 ? transactions.map((txn) => {
              const isIncome = txn.type === 'income'
              const sign = isIncome ? '+' : (txn.type === 'expense' ? '-' : '')
              const amountLabel = `${sign}${formatter.format(Number(txn.amount))}`
              const icon = txn.type === 'income' ? '💰' : (txn.type === 'expense' ? '💸' : '🔄')
              const accountName = accounts?.find(a => a.id === txn.account_id)?.name || 'Unknown Account'
              const categoryName = categories?.find(c => c.id === txn.category_id)?.name || 'Uncategorized'
              
              return (
                <div key={txn.id} className="group flex items-center justify-between py-2 border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC] rounded-lg -mx-2 px-2 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#F1F5F9] border border-[#E5E7EB]/50 text-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
                      {icon}
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

        {/* Add Transaction Form */}
        <div className="xl:col-span-4 rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm self-start">
          <h3 className="font-bold text-[#0f172a] text-[18px] mb-6">Log Transaction</h3>
          {accounts && accounts.length > 0 ? (
             <TransactionForm accounts={accounts} categories={categories || []} />
          ) : (
             <p className="text-[13px] text-[#64748b]">Please create an account first before logging a transaction.</p>
          )}
        </div>
      </div>
    </div>
  )
}
