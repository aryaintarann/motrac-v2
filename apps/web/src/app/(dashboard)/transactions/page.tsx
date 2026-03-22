import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Transaction } from '@motrac/shared'
import { TransactionForm } from '@/components/TransactionForm'

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
    .select('*, account:accounts(name), category:categories(name)')
    .order('date', { ascending: false })
  
  const transactions = rawTransactions || []
  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Transactions</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Transaction History */}
        <div className="lg:col-span-2 flex flex-col rounded-xl bg-[var(--surface)] p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="font-semibold mb-4 text-[var(--foreground)]">History</h3>
          <div className="flex flex-col divide-y divide-gray-100">
            {transactions.length > 0 ? transactions.map((txn) => {
              const isIncome = txn.type === 'income'
              const sign = isIncome ? '+' : (txn.type === 'expense' ? '-' : '')
              const amountLabel = `${sign}${formatter.format(Number(txn.amount))}`
              const icon = txn.type === 'income' ? '💰' : (txn.type === 'expense' ? '💸' : '🔄')
              const accountName = (txn.account as any)?.name || 'Unknown Account'
              const categoryName = (txn.category as any)?.name || 'Uncategorized'
              
              return (
                <div key={txn.id} className="group flex items-center justify-between py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
                      {icon}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--foreground)]">{txn.description || categoryName}</div>
                      <div className="text-xs text-gray-500">{accountName} • {new Date(txn.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={`font-medium ${isIncome ? 'text-green-600' : 'text-[var(--foreground)]'}`}>
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
        <div className="col-span-1 rounded-xl bg-gray-50 border border-dashed border-gray-300 p-6 self-start">
          <h3 className="font-semibold mb-4 text-[var(--foreground)]">Log Transaction</h3>
          {accounts && accounts.length > 0 ? (
             <TransactionForm accounts={accounts} categories={categories || []} />
          ) : (
             <p className="text-sm text-gray-500">Please create an account first before logging a transaction.</p>
          )}
        </div>
      </div>
    </div>
  )
}
