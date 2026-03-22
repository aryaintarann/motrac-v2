import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DebtForm } from '@/components/DebtForm'
import { markDebtPaid } from './actions'

export default async function DebtsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch Accounts for the Form
  const { data: accounts } = await supabase.from('accounts').select('*').order('name')

  // Fetch Debts
  const { data: rawDebts } = await supabase
    .from('debts')
    .select('*')
    .order('created_at', { ascending: false })
  
  const debts = rawDebts || []
  
  const iOwe = debts.filter(d => d.direction === 'i_owe')
  const owedToMe = debts.filter(d => d.direction === 'owed_to_me')
  
  const totalIOwe = iOwe.reduce((sum, d) => sum + Number(d.principal), 0)
  const totalOwedToMe = owedToMe.reduce((sum, d) => sum + Number(d.principal), 0)

  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-[-0.02em]">Debt & Receivables</h1>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 mb-5">
        <div className="rounded-[20px] border border-red-100 bg-red-50/50 p-6 shadow-sm flex flex-col justify-center">
           <h3 className="text-[14px] font-medium text-red-800/70 mb-1">Total I Owe (Debt)</h3>
           <div className="text-[28px] font-bold text-red-600 tracking-tight">{formatter.format(totalIOwe)}</div>
        </div>
        <div className="rounded-[20px] border border-green-100 bg-green-50/50 p-6 shadow-sm flex flex-col justify-center">
           <h3 className="text-[14px] font-medium text-green-800/70 mb-1">Total Owed To Me</h3>
           <div className="text-[28px] font-bold text-green-600 tracking-tight">{formatter.format(totalOwedToMe)}</div>
        </div>
        <div className="rounded-[20px] border border-blue-100 bg-blue-50/50 p-6 shadow-sm flex flex-col justify-center">
           <h3 className="text-[14px] font-medium text-blue-800/70 mb-1">Net Position</h3>
           <div className="text-[28px] font-bold text-blue-600 tracking-tight">{formatter.format(totalOwedToMe - totalIOwe)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Debt List */}
        <div className="xl:col-span-8 flex flex-col rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm">
          <h3 className="font-bold text-[#0f172a] text-[18px] mb-6">Active Records</h3>
          
          <div className="flex flex-col divide-y divide-gray-100">
            {debts.length > 0 ? debts.map((debt) => {
              const isOwedToMe = debt.direction === 'owed_to_me'
              
              return (
                <div key={debt.id} className="group flex items-center justify-between py-3 border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC] rounded-lg -mx-2 px-2 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] text-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border ${isOwedToMe ? 'bg-green-50/50 border-green-100/50 text-green-600' : 'bg-red-50/50 border-red-100/50 text-red-600'}`}>
                      {isOwedToMe ? '📥' : '📤'}
                    </div>
                    <div>
                      <div className="font-bold text-[#0f172a] text-[15px]">{debt.counterparty}</div>
                      <div className="flex items-center gap-3 text-[13px] text-[#64748b] mt-0.5 tracking-tight">
                        <span className={`px-2 py-0.5 rounded-[6px] font-bold text-[11px] uppercase tracking-wider ${isOwedToMe ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#EF4444]'}`}>
                          {isOwedToMe ? 'Owes You' : 'You Owe'}
                        </span>
                        {debt.due_date && <span>Due: {new Date(debt.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#0f172a] text-[15px]">
                      {formatter.format(Number(debt.principal)).replace('Rp', '').trim()} <span className="text-[#64748b] text-[13px]">IDR</span>
                    </div>
                    <form action={markDebtPaid}>
                      <input type="hidden" name="debt_id" value={debt.id} />
                      <button type="submit" className="text-[12px] font-bold text-[#2563EB] hover:text-blue-700 hover:underline mt-1 bg-blue-50/50 px-2 py-0.5 rounded-md">Mark Paid</button>
                    </form>
                  </div>
                </div>
              )
            }) : (
              <div className="py-8 text-center text-[13px] text-[#64748b]">No debts or receivables recorded.</div>
            )}
          </div>
        </div>

        {/* Add Record Form */}
        <div className="xl:col-span-4 rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm self-start">
          <h3 className="font-bold text-[#0f172a] text-[18px] mb-6">Log New Record</h3>
          <DebtForm accounts={accounts || []} />
        </div>
      </div>
    </div>
  )
}
