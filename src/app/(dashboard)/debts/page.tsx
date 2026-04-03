import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DebtForm } from '@/components/DebtForm'
import { AddDebtModal } from '@/components/AddDebtModal'
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
    <div className="mx-auto max-w-[900px]">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-[-0.02em]">Debt & Receivables</h1>
        <AddDebtModal accounts={accounts || []} />
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

      <div className="grid grid-cols-1 gap-5">
        {/* Debt List */}
        <div className="flex flex-col rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm">
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
                    <form action={markDebtPaid} className="mt-2.5">
                      <input type="hidden" name="debt_id" value={debt.id} />
                      <button type="submit" className="flex items-center justify-center w-[120px] ml-auto gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Mark Paid
                      </button>
                    </form>
                  </div>
                </div>
              )
            }) : (
              <div className="py-8 text-center text-[13px] text-[#64748b]">No debts or receivables recorded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
