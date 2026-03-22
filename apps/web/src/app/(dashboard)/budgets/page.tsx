import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BudgetForm } from '@/components/BudgetForm'

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
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Pacing & Budgets</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Budget History */}
        <div className="lg:col-span-2 flex flex-col rounded-xl bg-[var(--surface)] p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="font-semibold mb-4 text-[var(--foreground)]">Past Budgets</h3>
          <div className="flex flex-col divide-y divide-gray-100">
            {budgets.length > 0 ? budgets.map((b) => {
              const total = Number(b.needs_amount) + Number(b.wants_amount) + Number(b.savings_amount)
              return (
                <div key={b.id} className="group flex items-center justify-between py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500 font-bold">
                      {b.month.split('-')[1]}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--foreground)]">{b.month}</div>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1">
                        <span>Needs: {formatter.format(Number(b.needs_amount))}</span>
                        <span>Wants: {formatter.format(Number(b.wants_amount))}</span>
                        <span>Savings: {formatter.format(Number(b.savings_amount))}</span>
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-[var(--foreground)]">
                    {formatter.format(total)}
                  </div>
                </div>
              )
            }) : (
              <div className="py-8 text-center text-sm text-gray-500">No budgets define yet. Set one up to enable AI Pacing!</div>
            )}
          </div>
        </div>

        {/* Edit Current Budget Form */}
        <div className="col-span-1 rounded-xl bg-gray-50 border border-dashed border-gray-300 p-6 self-start">
          <h3 className="font-semibold mb-4 text-[var(--foreground)]">Current Month ({currentMonth})</h3>
          <BudgetForm />
        </div>
      </div>
    </div>
  )
}
