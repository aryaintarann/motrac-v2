import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AddBudgetModal } from '@/components/AddBudgetModal'

export default async function BudgetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: rawBudgets } = await supabase
    .from('budgets')
    .select('*')
    .order('month', { ascending: false })
  
  const budgets = rawBudgets || []
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentBudget = budgets.find(b => b.month === currentMonth)
  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-[-0.02em]">Pacing & Budgets</h1>
        <AddBudgetModal />
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Budget History */}
        <div className="flex flex-col rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm">
          <h3 className="font-bold text-[#0f172a] text-[18px] mb-6">Past Budgets</h3>
          <div className="flex flex-col divide-y divide-gray-100">
            {budgets.length > 0 ? budgets.map((b) => {
              const total = Number(b.needs_amount) + Number(b.wants_amount) + Number(b.savings_amount)
              return (
                <div key={b.id} className="group flex items-center justify-between py-3 border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC] rounded-lg -mx-2 px-3 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-[#EFF6FF] border border-blue-100/50 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] text-blue-600 font-bold">
                      {b.month.split('-')[1]}
                    </div>
                    <div>
                      <div className="font-bold text-[#0f172a] text-[15px]">{b.month}</div>
                      <div className="flex gap-3 text-[13px] text-[#64748b] mt-0.5 tracking-tight">
                        <span>Needs: {formatter.format(Number(b.needs_amount)).replace('Rp', '').trim()}</span>
                        <span>Wants: {formatter.format(Number(b.wants_amount)).replace('Rp', '').trim()}</span>
                        <span>Savings: {formatter.format(Number(b.savings_amount)).replace('Rp', '').trim()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-[#0f172a] text-[15px] text-right">
                    {formatter.format(total).replace('Rp', '').trim()} <span className="text-[#64748b] text-[13px]">IDR</span>
                  </div>
                </div>
              )
            }) : (
              <div className="py-8 text-center text-sm text-gray-500">No budgets define yet. Set one up to enable AI Pacing!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
