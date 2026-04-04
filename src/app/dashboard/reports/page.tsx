import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PrintButton } from '@/components/PrintButton'
import { ReportTable } from '@/components/ReportTable'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentMonthStr = new Date().toISOString().slice(0, 7) // YYYY-MM
  
  // Fetch all transactions so the Detailed Log filters can search all history
  const { data: rawTxns } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  // Fetch categories to map names and colors
  const { data: categories } = await supabase.from('categories').select('*')
  
  const txns = rawTxns || []
  
  // Isolate current month transactions for the Overview Cards
  const currentMonthTxns = txns.filter(t => t.date.startsWith(currentMonthStr))
  
  const expenses = currentMonthTxns.filter(t => t.type === 'expense')
  const income = currentMonthTxns.filter(t => t.type === 'income')
  
  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0)

  // Group expenses by category
  const expenseByCategory: Record<string, { name: string, amount: number, color: string }> = {}
  
  expenses.forEach(txn => {
    const catId = txn.category_id || 'uncategorized'
    if (!expenseByCategory[catId]) {
      const cat = categories?.find(c => c.id === catId)
      expenseByCategory[catId] = {
        name: cat?.name || 'Uncategorized',
        color: cat?.color || '#9ca3af',
        amount: 0
      }
    }
    expenseByCategory[catId].amount += Number(txn.amount)
  })

  // Sort categories by amount descending
  const sortedCategories = Object.values(expenseByCategory).sort((a, b) => b.amount - a.amount)

  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-[-0.02em]">Insights & Reports</h1>
        <PrintButton />
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-[32px] font-bold text-gray-900 tracking-tight">DANAROUTE Financial Report</h1>
        <p className="text-gray-500 mt-1">Summary for {currentMonthStr}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm flex flex-col justify-center">
           <h3 className="text-[14px] font-medium text-[#64748b] mb-1">Total Income</h3>
           <div className="text-[28px] font-bold text-[#16a34a] tracking-tight">+{formatter.format(totalIncome).replace('Rp', '').trim()} <span className="text-[16px] text-gray-400">IDR</span></div>
        </div>
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm flex flex-col justify-center">
           <h3 className="text-[14px] font-medium text-[#64748b] mb-1">Total Expenses</h3>
           <div className="text-[28px] font-bold text-[#ef4444] tracking-tight">-{formatter.format(totalExpense).replace('Rp', '').trim()} <span className="text-[16px] text-gray-400">IDR</span></div>
        </div>
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm flex flex-col justify-center bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
           <h3 className="text-[14px] font-medium text-[#64748b] mb-1">Net Cash Flow</h3>
           <div className={`text-[28px] font-bold tracking-tight ${totalIncome - totalExpense >= 0 ? 'text-[#2563EB]' : 'text-[#ef4444]'}`}>
             {formatter.format(totalIncome - totalExpense).replace('Rp', '').trim()} <span className="text-[16px] text-gray-400">IDR</span>
           </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm mb-8">
        <h3 className="font-bold text-[#0f172a] text-[18px] mb-6">Expense Breakdown</h3>
        
        {sortedCategories.length > 0 ? (
          <div className="space-y-6">
            {sortedCategories.map(cat => {
              const pct = totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0
              return (
                <div key={cat.name}>
                  <div className="flex justify-between items-end mb-2">
                    <div className="font-bold text-[#0f172a] text-[15px]">{cat.name}</div>
                    <div className="text-right">
                      <div className="font-bold text-[#0f172a] text-[15px]">{formatter.format(cat.amount).replace('Rp', '').trim()} <span className="text-[#64748b] text-[12px]">IDR</span></div>
                      <div className="text-[12px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md inline-block mt-1">{pct}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-[#F1F5F9] rounded-full h-2.5 max-w-full overflow-hidden shadow-inner">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-1000 print:!bg-gray-800" 
                      style={{ width: `${pct}%`, backgroundColor: cat.color }} 
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-[13px] text-[#64748b]">No expenses recorded this month yet.</div>
        )}
      </div>

      {/* Transaction Log Filterable Table */}
      <ReportTable txns={txns} categories={categories || []} />
    </div>
  )
}
